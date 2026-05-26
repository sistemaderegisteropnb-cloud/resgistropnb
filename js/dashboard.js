document.addEventListener('DOMContentLoaded', async () => {
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    const btnLogout = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    async function initDashboard() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) { window.location.href = 'index.html'; return; }

            userEmailEl.textContent = session.user.email;
            const rol = sessionStorage.getItem('pnb_user_nivel') || 'consultor';
            userRoleEl.textContent = rol;

            // 🔐 Aplicar reglas de visibilidad por nivel
            aplicarPermisos(rol);
            configurarMenu();
        } catch (error) {
            console.error('Error iniciando dashboard:', error);
            window.location.href = 'index.html';
        }
    }

    // 🔒 Matriz de permisos según tu indicación
    function aplicarPermisos(rol) {
        const allMenuItems = document.querySelectorAll('.menu-item');
        const allSubItems = document.querySelectorAll('.submenu-item');

        // 🔹 CONSULTOR: SOLO ve "Consulta"
        if (rol === 'consultor') {
            allMenuItems.forEach(item => item.style.display = 'none');
            const consultaBtn = document.querySelector('[data-section="consulta"]');
            if (consultaBtn) consultaBtn.closest('.menu-item').style.display = 'block';
            return;
        }

        // 🔹 MODERADOR: Ve "Consulta", "Registrar" (en los 3 módulos) y "Procesar"
        // ❌ NO ve: Modificar, Eliminar, Gestión de Usuarios
        if (rol === 'moderador') {
            // Ocultar Gestión de Usuarios
            const gestionItem = document.getElementById('menu-gestion-usuarios');
            if (gestionItem) gestionItem.style.display = 'none';

            // Ocultar todas las opciones de modificar y eliminar
            allSubItems.forEach(item => {
                const action = item.dataset.action || '';
                if (action.includes('modificar') || action.includes('eliminar')) {
                    item.style.display = 'none';
                }
            });
            return;
        }

        // 🔹 ADMINISTRADOR: Ve todo (no se oculta nada)
    }

    // 🎛️ Navegación y eventos
    function configurarMenu() {
        // Submenús desplegables
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
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

        // Cambio de sección
        document.querySelectorAll('[data-section], [data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = el.dataset.section || el.dataset.action;
                
                document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    // Marcar botón activo
                    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                    if (el.classList.contains('menu-btn')) el.classList.add('active');
                }

                if (window.innerWidth <= 900) sidebar.classList.remove('open');
            });
        });

        // Toggle sidebar móvil
        if (menuToggle) {
            menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    // 🚪 Cerrar sesión
    btnLogout.addEventListener('click', async () => {
        try {
            await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            window.location.href = 'index.html';
        } catch (err) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    // ▶️ Iniciar
    initDashboard();
});
