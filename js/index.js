document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const btn = document.getElementById('btn-acceso');
    const msgBox = document.getElementById('mensaje');

    function mostrarMensaje(texto, tipo) {
        msgBox.textContent = texto;
        msgBox.className = `mensaje ${tipo}`;
        msgBox.style.display = 'block';
        setTimeout(() => { msgBox.style.display = 'none'; }, 4000);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = 'Verificando...';
        msgBox.style.display = 'none';

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const nivelSeleccionado = document.getElementById('nivel').value;

        try {
            // 1️⃣ Autenticación con Supabase
            const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
                email, password
            });
            if (authErr) throw new Error('Credenciales incorrectas o cuenta inactiva.');

            // 2️⃣ Verificar nivel asignado en BD (seguridad real)
            const { data: perfil, error: perfilErr } = await supabase
                .from('perfiles_usuario')
                .select('nivel')
                .eq('user_id', auth.user.id)
                .single();

            if (perfilErr || !perfil) throw new Error('Perfil de acceso no encontrado.');
            if (perfil.nivel !== nivelSeleccionado) {
                throw new Error('El nivel seleccionado no coincide con el asignado por la institución.');
            }

            // 3️⃣ Guardar sesión y redirigir
            sessionStorage.setItem('pnb_user_id', auth.user.id);
            sessionStorage.setItem('pnb_user_email', auth.user.email);
            sessionStorage.setItem('pbn_user_nivel', perfil.nivel);

            mostrarMensaje('✅ Acceso concedido. Cargando panel...', 'exito');
            
            // ⏳ Aquí puedes redirigir a la vista correspondiente cuando la crees
            // setTimeout(() => window.location.href = 'panel.html', 1500);

        } catch (err) {
            console.error('Error de acceso:', err);
            mostrarMensaje('❌ ' + err.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Iniciar Sesión';
        }
    });
});

