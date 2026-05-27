document.addEventListener('DOMContentLoaded', async () => {
    // 🔒 1. Verificar sesión activa
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = '../index.html';
        return;
    }

    // Mostrar nivel del usuario en el navbar
    document.getElementById('user-role').textContent = sessionStorage.getItem('pnb_user_nivel')?.toUpperCase() || 'USUARIO';

    // 📝 2. Manejo del formulario
    const form = document.getElementById('form-registro-personas');
    const btn = form.querySelector('.btn-submit');
    const msg = document.getElementById('msg-personas');
    const originalText = btn.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = '⏳ Guardando en sistema...';
        msg.style.display = 'none';

        const cedula = document.getElementById('p-cedula').value.trim().toUpperCase();
        const nombres = document.getElementById('p-nombres').value.trim();
        const apellidos = document.getElementById('p-apellidos').value.trim();
        const telefono = document.getElementById('p-telefono').value.trim() || null;

        // 🔍 Validación estricta de cédula venezolana
        const regexCedula = /^[VE]-\d{7,8}$/;
        if (!regexCedula.test(cedula)) {
            mostrarMsg('❌ Formato inválido. Use: V-12345678 o E-12345678', 'error');
            btn.disabled = false;
            btn.textContent = originalText;
            return;
        }

        try {
            const { error } = await window.supabaseClient.from('personas').insert([
                { cedula, nombres, apellidos, telefono }
            ]);

            if (error) {
                if (error.code === '23505') throw new Error('Esta cédula ya está registrada en el sistema.');
                throw new Error(error.message || 'Error de conexión con la base de datos.');
            }

            mostrarMsg('✅ Persona registrada exitosamente en la base de datos.', 'success');
            form.reset();
        } catch (err) {
            console.error('Error registro:', err);
            mostrarMsg('❌ ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    function mostrarMsg(texto, tipo) {
        msg.textContent = texto;
        msg.className = `msg ${tipo}`;
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
    }
});
