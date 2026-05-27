document.addEventListener('DOMContentLoaded', async () => {
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    const btnLogout = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const appContent = document.getElementById('app-content');

    async function initDashboard() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }

        userEmailEl.textContent = session.user.email;
        const rol = sessionStorage.getItem('pnb_user_nivel') || 'consultor';
        userRoleEl.textContent = rol;

        aplicarPermisos(rol);
        configurarMenu();
        
        // Cargar módulo por defecto
        const primerModulo = document.querySelector('.menu-btn[data-src]');
        if (primerModulo) cargarModulo(primerModulo.dataset.src, primerModulo.dataset.js, primerModulo.dataset.init);
    }

    function aplicarPermisos(rol) {
        const gestionItem = document.getElementById('menu-gestion-usuarios');
        if (rol === 'consultor') {
            document.querySelectorAll('.menu-btn:not([data-src="html/consulta.html"])').forEach(b => b.closest('.menu-item').classList.add('hidden'));
            return;
        }
        if (rol === 'moderador' && gestionItem) gestionItem.classList.add('hidden');
    }

    // 🔹 MOTOR DE CARGA DINÁMICA
    async function cargarModulo(htmlPath, jsPath, initFnName) {
        appContent.innerHTML = '<div class="loading">⏳ Cargando módulo...</div>';
        try {
            const res = await fetch(htmlPath + '?v=' + Date.now()); // Cache-buster
            if (!res.ok) throw new Error('Archivo no encontrado');
            
            appContent.innerHTML = await res.text();

            if (jsPath) {
                const script = document.createElement('script');
                script.src = jsPath + '?v=' + Date.now();
                script.onload = () => {
                    if (initFnName && typeof window[initFnName] === 'function') {
                        window[initFnName]();
                    }
                };
                document.head.appendChild(script);
            }
        } catch (err) {
            appContent.innerHTML = `<div class="card"><div class="placeholder error">❌ Error al cargar: ${err.message}</div></div>`;
        }
    }

    function configurarMenu() {
        // Toggle submenús
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const submenu = document.getElementById(btn.dataset.toggle);
                document.querySelectorAll('.submenu').forEach(sm => sm !== submenu && sm.classList.remove('show'));
                submenu.classList.toggle('show');
            });
        });

        // Navegación por módulos
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-src]');
            if (!btn) return;
            e.preventDefault();

            document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            await cargarModulo(btn.dataset.src, btn.dataset.js, btn.dataset.init);
            if (window.innerWidth <= 900) sidebar.classList.remove('open');
        });

        if (menuToggle) {
            menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) sidebar.classList.remove('open');
            });
        }
    }

    btnLogout.addEventListener('click', async () => {
        await window.supabaseClient.auth.signOut();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    initDashboard();
});
