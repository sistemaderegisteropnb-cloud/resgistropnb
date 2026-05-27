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
        iniciarReloj(); // ⏰ Iniciar reloj en tiempo real
        
        // Cargar primer módulo por defecto
        const primerModulo = document.querySelector('.menu-btn[data-src]');
        if (primerModulo) cargarModulo(primerModulo.dataset.src, primerModulo.dataset.js, primerModulo.dataset.init);
    }

    // 🔒 Matriz de permisos estricta
    function aplicarPermisos(rol) {
        const allSubItems = document.querySelectorAll('.submenu-item');
        const gestionItem = document.getElementById('menu-gestion-usuarios');

        // 👁️ CONSULTOR: Solo ve "Consulta"
        if (rol === 'consultor') {
            document.querySelectorAll('.menu-item').forEach(item => item.style.display = 'none');
            const consultaBtn = document.querySelector('[data-toggle="submenu-consulta"]');
            if (consultaBtn) consultaBtn.closest('.menu-item').style.display = 'block';
            return;
        }

        // 🛡️ MODERADOR: Ve todo MENOS Modificar, Eliminar y Gestión de Usuarios
        if (rol === 'moderador') {
            // Ocultar Gestión de Usuarios
            if (gestionItem) gestionItem.style.display = 'none';
            
            // Ocultar dinámicamente TODAS las opciones de Modificar y Eliminar
            allSubItems.forEach(item => {
                const src = item.dataset.src || '';
                if (src.includes('mod-') || src.includes('elim-')) {
                    item.style.display = 'none';
                }
            });
            return;
        }

        // 🔑 ADMINISTRADOR: Ve todo (no se oculta nada)
    }

    // 🔹 MOTOR DE CARGA DINÁMICA
    async function cargarModulo(htmlPath, jsPath, initFnName) {
        appContent.innerHTML = '<div class="loading">⏳ Cargando módulo...</div>';
        try {
            const res = await fetch(htmlPath + '?v=' + Date.now());
            if (!res.ok) throw new Error('Archivo no encontrado');
            appContent.innerHTML = await res.text();

            if (jsPath) {
                const script = document.createElement('script');
                script.src = jsPath + '?v=' + Date.now();
                script.onload = () => {
                    if (initFnName && typeof window[initFnName] === 'function') window[initFnName]();
                };
                document.head.appendChild(script);
            }
        } catch (err) {
            appContent.innerHTML = `<div class="card"><div class="placeholder error">❌ Error al cargar: ${err.message}</div></div>`;
        }
    }

    function configurarMenu() {
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const submenu = document.getElementById(btn.dataset.toggle);
                document.querySelectorAll('.submenu').forEach(sm => {
                    if (sm.id !== btn.dataset.toggle) {
                        sm.classList.remove('show');
                        document.querySelector(`[data-toggle="${sm.id}"]`)?.classList.remove('expanded');
                    }
                });
                submenu.classList.toggle('show');
                btn.classList.toggle('expanded');
            });
        });

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

    // ⏰ Reloj en tiempo real
    function iniciarReloj() {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;
        const actualizar = () => {
            const ahora = new Date();
            const opciones = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            clockEl.textContent = ahora.toLocaleString('es-VE', opciones).replace(',', '');
        };
        actualizar();
        setInterval(actualizar, 1000);
    }

    btnLogout.addEventListener('click', async () => {
        await window.supabaseClient.auth.signOut();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    initDashboard();
});
