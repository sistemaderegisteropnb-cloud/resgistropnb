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
        const rol = sessionStorage.getItem('pnb_user_nivel') || 'consultor';
        userRoleEl.textContent = rol;

        // 3. Aplicar restricciones de menú
        aplicarPermisos(rol);

        // 4. Configurar eventos del menú
        configurarMenu();

        // 5. Iniciar reloj
        iniciarReloj();
        
        // Nota: No cargamos ningún módulo por defecto automáticamente 
        // para que el mensaje de bienvenida permanezca visible hasta que el usuario haga clic.
    }

    // 🔒 Matriz de permisos estricta
    function aplicarPermisos(rol) {
        // PASO 1: Ocultar elementos marcados como "admin" si el usuario no es admin
        // Esto oculta automáticamente: Procesar, Historial y Gestión de Usuarios para Moderadores/Consultores.
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            const menuItem = el.closest('.menu-item');
            if (rol !== 'admin' && menuItem) {
                menuItem.style.display = 'none';
            }
        });

        // PASO 2: Lógica para Consultor (Solo ve "Consulta")
        if (rol === 'consultor') {
            // Ocultar todos los ítems del menú
            document.querySelectorAll('.menu-item').forEach(item => item.style.display = 'none');
            
            // Mostrar solo el bloque de Consulta
            const consultaBtn = document.querySelector('[data-toggle="submenu-consulta"]');
            if (consultaBtn) {
                consultaBtn.closest('.menu-item').style.display = 'block';
            }
            return;
        }

        // PASO 3: Lógica para Moderador (Ve todo menos Modificar, Eliminar)
        // Nota: Como Procesar e Historial ya se ocultaron en el Paso 1 (son data-role="admin"),
        // solo nos resta ocultar los enlaces individuales de "mod-" y "elim-" en los otros menús.
        if (rol === 'moderador') {
            const allSubItems = document.querySelectorAll('.submenu-item');
            allSubItems.forEach(item => {
                const src = item.dataset.src || '';
                // Ocultar enlaces que contengan 'mod-' o 'elim-' en su ruta
                if (src.includes('mod-') || src.includes('elim-')) {
                    item.style.display = 'none';
                }
            });
        }

        // PASO 4: Administrador
        // No se oculta nada adicional. Ve todo.
    }

    // 🔹 MOTOR DE CARGA DINÁMICA
    async function cargarModulo(htmlPath, jsPath, initFnName) {
        appContent.innerHTML = '<div class="loading">⏳ Cargando módulo...</div>';
        try {
            // Agregar timestamp para evitar caché del navegador
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
            appContent.innerHTML = `<div class="card"><div class="placeholder error" style="color:#b91c1c;border-color:#fca5a5;background:#fef2f2;padding:40px;border:2px dashed;border-radius:8px;text-align:center;">❌ Error al cargar: ${err.message}</div></div>`;
        }
    }

    // 🔹 CONFIGURACIÓN DEL MENÚ (TOGGLES Y CLICKS)
    function configurarMenu() {
        // 1. Manejo de Submenús
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const submenuId = btn.dataset.toggle;
                const submenu = document.getElementById(submenuId);
                
                // Cerrar otros submenús
                document.querySelectorAll('.submenu').forEach(sm => {
                    if (sm.id !== submenuId) {
                        sm.classList.remove('show');
                        // Quitar clase expanded del botón correspondiente si existe
                        const otherBtn = document.querySelector(`[data-toggle="${sm.id}"]`);
                        if(otherBtn) otherBtn.classList.remove('expanded');
                    }
                });

                // Alternar submenú actual
                submenu.classList.toggle('show');
                btn.classList.toggle('expanded');
            });
        });

        // 2. Manejo de Carga de Módulos
        document.addEventListener('click', async (e) => {
            // Buscar si se hizo clic en un botón o enlace con data-src
            const target = e.target.closest('[data-src]');
            if (!target) return;

            e.preventDefault();
            
            // Actualizar estado activo
            document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
            // Si es un botón de menú principal
            if(target.classList.contains('menu-btn')) target.classList.add('active');
            
            // Cargar módulo
            await cargarModulo(target.dataset.src, target.dataset.js, target.dataset.init);

            // En móvil, cerrar sidebar al seleccionar
            if (window.innerWidth <= 900) sidebar.classList.remove('open');
        });

        // 3. Menú Móvil
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

    // 🔴 Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Iniciar aplicación
    initDashboard();
});
