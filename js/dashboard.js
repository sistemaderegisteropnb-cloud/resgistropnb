document.addEventListener('DOMContentLoaded', async () => {
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    const btnLogout = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const appContent = document.getElementById('app-content');

    async function initDashboard() {
        // 1. Verificar sesión
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) { 
            window.location.href = 'index.html'; 
            return; 
        }

        // 2. Mostrar info del usuario
        userEmailEl.textContent = session.user.email;
        // Obtener rol y normalizar a minúsculas para evitar errores de tipeo
        const rol = (sessionStorage.getItem('pnb_user_nivel') || 'consultor').toLowerCase();
        userRoleEl.textContent = rol;

        // 3. Aplicar restricciones de menú según rol exacto de tu base de datos
        aplicarPermisos(rol);

        // 4. Configurar eventos del menú
        configurarMenu();

        // 5. Iniciar reloj
        iniciarReloj();
        
        // No cargar módulo por defecto para mostrar bienvenida
    }

    // 🔒 Matriz de permisos estricta (Basada en perfiles_usuario_rows.csv)
    function aplicarPermisos(rol) {
        // PASO 1: Resetear visibilidad (Mostrar TODO primero)
        document.querySelectorAll('.menu-item').forEach(item => item.style.display = 'block');
        document.querySelectorAll('.submenu-item').forEach(item => item.style.display = 'block');
        document.getElementById('menu-historial')?.style.removeProperty('display');
        document.getElementById('menu-gestion-usuarios')?.style.removeProperty('display');

        // PASO 2: Aplicar restricciones según nivel
        if (rol === 'consultor') {
            // 👁️ CONSULTOR: Solo ve "Consulta"
            document.querySelectorAll('.menu-item').forEach(item => {
                if (!item.querySelector('[data-toggle="submenu-consulta"]')) {
                    item.style.display = 'none';
                }
            });
        } 
        else if (rol === 'moderador') {
            // 🛡️ MODERADOR: Ve todo MENOS Modificar, Eliminar, Gestión de Usuarios e Historial
            
            // Ocultar Historial y Gestión de Usuarios
            document.getElementById('menu-historial')?.style.setProperty('display', 'none', 'important');
            document.getElementById('menu-gestion-usuarios')?.style.setProperty('display', 'none', 'important');
            
            // Ocultar enlaces de Modificar y Eliminar en todos los submenús
            document.querySelectorAll('.submenu-item').forEach(item => {
                const src = item.dataset.src || '';
                if (src.includes('mod-') || src.includes('elim-')) {
                    item.style.setProperty('display', 'none', 'important');
                }
            });
        }
        else if (rol === 'administrador') {
            // 🔑 ADMINISTRADOR: Ve todo (No se hace nada, gracias al reset del Paso 1)
        }
        else {
            // Rol desconocido: Tratar como consultor por seguridad
            document.querySelectorAll('.menu-item').forEach(item => {
                if (!item.querySelector('[data-toggle="submenu-consulta"]')) {
                    item.style.display = 'none';
                }
            });
        }
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
                    if (initFnName && typeof window[initFnName] === 'function') {
                        window[initFnName]();
                    }
                };
                document.head.appendChild(script);
            }
        } catch (err) {
            console.error(err);
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
                if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
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
