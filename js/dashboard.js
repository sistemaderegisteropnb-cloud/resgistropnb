document.addEventListener('DOMContentLoaded', async () => {
    // 🔹 Elementos del DOM
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    const btnLogout = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const menuGestionUsuarios = document.getElementById('menu-gestion-usuarios');

    // 🔹 Verificar sesión y cargar datos
    async function initDashboard() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            
            if (!session) {
                window.location.href = 'index.html';
                return;
            }

            // Mostrar datos del usuario
            userEmailEl.textContent = session.user.email;
            const rol = sessionStorage.getItem('pnb_user_nivel') || 'consultor';
            userRoleEl.textContent = rol;

            // 🔐 Restringir menú según nivel
            aplicarPermisos(rol);

            // Configurar eventos del menú
            configurarMenu();

        } catch (error) {
            console.error('Error inicializando dashboard:', error);
            window.location.href = 'index.html';
        }
    }

    // 🔐 Aplicar permisos por nivel
    function aplicarPermisos(rol) {
        // Consultor: solo puede ver "Consulta" y "Registrar" (sin modificar/eliminar)
        if (rol === 'consultor') {
            // Ocultar opciones de modificar/eliminar en todos los submenús
            document.querySelectorAll('.submenu-item[data-action*="modificar"], .submenu-item[data-action*="eliminar"]').forEach(el => {
                el.closest('.menu-item').classList.add('hidden');
            });
            // Ocultar gestión de usuarios y procesar
            if (menuGestionUsuarios) menuGestionUsuarios.classList.add('hidden');
            document.querySelector('[data-section="procesar"]').closest('.menu-item').classList.add('hidden');
        }
        
        // Moderador: puede registrar y modificar, pero no eliminar ni gestionar usuarios
        if (rol === 'moderador') {
            document.querySelectorAll('.submenu-item[data-action*="eliminar"]').forEach(el => {
                el.closest('.menu-item')?.classList.add('hidden');
            });
            if (menuGestionUsuarios) menuGestionUsuarios.classList.add('hidden');
        }
        
        // Administrador: ve todo (no se oculta nada)
    }

    // 🎛️ Configurar interactividad del menú
    function configurarMenu() {
        // Toggle submenús desplegables
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const submenuId = btn.dataset.toggle;
                const submenu = document.getElementById(submenuId);
                
                // Cerrar otros submenús
                document.querySelectorAll('.submenu').forEach(sm => {
                    if (sm.id !== submenuId) sm.classList.remove('show');
                    document.querySelector(`[data-toggle="${sm.id}"]`)?.classList.remove('expanded');
                });
                
                // Alternar actual
                submenu.classList.toggle('show');
                btn.classList.toggle('expanded');
            });
        });

        // Navegación entre secciones
        document.querySelectorAll('[data-section], [data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Obtener ID de la sección a mostrar
                const sectionId = el.dataset.section || el.dataset.action;
                if (!sectionId) return;

                // Ocultar todas las secciones
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.remove('active');
                });

                // Mostrar la seleccionada
                const target = document.getElementById(sectionId);
                if (target) {
                    target.classList.add('active');
                    // Marcar como activo en el menú
                    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                    if (el.classList.contains('menu-btn')) {
                        el.classList.add('active');
                    }
                }

                // Cerrar sidebar en móvil después de seleccionar
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('open');
                }
            });
        });

        // Toggle sidebar en móvil
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Cerrar sidebar al hacer clic fuera en móvil
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // 🚪 Cerrar sesión
    btnLogout.addEventListener('click', async () => {
        try {
            await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    // ▶️ Iniciar
    initDashboard();
});
