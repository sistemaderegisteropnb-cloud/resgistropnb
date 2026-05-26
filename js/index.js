document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const btn = document.getElementById('btn-acceso');
    const msgBox = document.getElementById('mensaje');

    if (!form) {
        console.error('⚠️ Formulario #login-form no encontrado en el DOM');
        return;
    }

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

        // ✅ Acceso seguro a los inputs sin getElementById
        const email = form.elements['email'].value.trim().toLowerCase();
        const password = form.elements['password'].value;

        try {
            const { data: auth, error: authErr } = await window.supabaseClient.auth.signInWithPassword({
                email, password
            });
            if (authErr) throw new Error('Credenciales incorrectas o cuenta inactiva.');

            const { data: perfil, error: perfilErr } = await window.supabaseClient
                .from('perfiles_usuario')
                .select('nivel')
                .eq('user_id', auth.user.id)
                .single();

            if (perfilErr || !perfil) throw new Error('Perfil de acceso no encontrado.');

            sessionStorage.setItem('pnb_user_id', auth.user.id);
            sessionStorage.setItem('pnb_user_email', auth.user.email);
            sessionStorage.setItem('pnb_user_nivel', perfil.nivel);

            mostrarMensaje('✅ Acceso concedido. Redirigiendo...', 'exito');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);

        } catch (err) {
            console.error('Error de acceso:', err);
            mostrarMensaje('❌ ' + err.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Iniciar Sesión';
        }
    });
});
