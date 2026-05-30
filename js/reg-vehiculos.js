window.initRegVehiculos = function() {
    // 🔹 1. Llenar Select de Años (1850 -> Hoy)
    const anioSelect = document.getElementById('v_anio');
    if (anioSelect) {
        const currentYear = new Date().getFullYear();
        anioSelect.innerHTML = '<option value="">Seleccione año...</option>';
        for (let y = currentYear; y >= 1850; y--) anioSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }

    // 🔹 2. Selector de Tipo (Moto/Auto)
    window.selectVehicleType = function(type) {
        document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
        document.getElementById('v_tipo').value = (type === 'moto') ? 'Motocicleta' : 'Automóvil';
        
        const isMoto = type === 'moto';
        document.getElementById('grid-fotos-moto').style.display = isMoto ? 'grid' : 'none';
        document.getElementById('grid-fotos-auto').style.display = isMoto ? 'none' : 'grid';
        document.getElementById('box-cilindraje').style.display = isMoto ? 'block' : 'none';
        
        // Limpiar inputs de fotos al cambiar tipo
        document.querySelectorAll('input[type="file"]').forEach(i => i.value = '');
        document.querySelectorAll('.img-preview').forEach(i => i.style.display = 'none');
    };

    // 🔹 3. Vista Previa de Imágenes
    const setupPreview = (inputId, previewId) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) { const r = new FileReader(); r.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; }; r.readAsDataURL(file); }
            else preview.style.display = 'none';
        });
    };
    // Fotos Moto
    setupPreview('v_foto_frontal', 'prev_v_frontal');
    setupPreview('v_foto_trasera', 'prev_v_trasera');
    setupPreview('v_foto_der', 'prev_v_der');
    setupPreview('v_foto_izq', 'prev_v_izq');
    // Fotos Auto
    setupPreview('v_foto_frontal_a', 'prev_v_frontal_a');
    setupPreview('v_foto_trasera_a', 'prev_v_trasera_a');
    setupPreview('v_foto_lateral_a', 'prev_v_lateral_a');

    // 🔹 4. Envío del Formulario
    const form = document.getElementById('form-reg-vehiculos');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-vehiculos');
    const mostrarError = (t) => { if(msg){msg.textContent='❌ '+t; msg.className='msg error'; msg.style.display='block';} };

    if (!form || !btn) return console.error('❌ Formulario no encontrado');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const placa = document.getElementById('v_placa').value.trim().toUpperCase();
        const anio = parseInt(document.getElementById('v_anio').value);
        const serialCarro = document.getElementById('v_serial_carroceria').value.trim();
        const color = document.getElementById('v_color').value.trim();
        
        if (placa.length < 6) return mostrarError('Verifique la placa (mínimo 6 caracteres).');
        if (isNaN(anio) || anio < 1850) return mostrarError('Seleccione un año válido.');
        if (!serialCarro) return mostrarError('El serial de carrocería es obligatorio.');
        if (!color) return mostrarError('El color es obligatorio.');

        btn.disabled = true; btn.textContent = '⏳ Guardando...'; if(msg) msg.style.display='none';

        try {
            const isMoto = document.getElementById('v_tipo').value === 'Motocicleta';
            const tablaDestino = isMoto ? 'registro_motos' : 'registro_automoviles';
            const bucket = window.supabaseClient.storage.from('fotos_vehiculos');
            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();

            // Helper para subir fotos
            const uploadFile = async (inputId, suffix) => {
                const el = document.getElementById(inputId);
                const file = el?.files[0];
                if (!file) throw new Error(`Falta la fotografía: ${el.previousElementSibling.textContent}`);
                const path = `${uid}/${ts}_${suffix}.jpg`;
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo imágenes.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            let urls = {};
            if (isMoto) {
                [urls.f, urls.r, urls.rd, urls.ri] = await Promise.all([
                    uploadFile('v_foto_frontal', 'f'), uploadFile('v_foto_trasera', 't'),
                    uploadFile('v_foto_der', 'rd'), uploadFile('v_foto_izq', 'ri')
                ]);
            } else {
                [urls.f, urls.r, urls.l] = await Promise.all([
                    uploadFile('v_foto_frontal_a', 'f'), uploadFile('v_foto_trasera_a', 't'),
                    uploadFile('v_foto_lateral_a', 'l')
                ]);
            }

            const data = {
                estatus: 'Verificación',
                estacion_policial: document.getElementById('v_estacion')?.value || 'EPP GENERICA',
                placa, anio, color, serial_carroceria: serialCarro,
                marca: document.getElementById('v_marca').value.trim(),
                modelo: document.getElementById('v_modelo').value.trim(),
                observaciones: document.getElementById('v_observaciones')?.value.trim() || null
            };

            if (isMoto) {
                data.serial_motor = document.getElementById('v_serial_motor').value.trim() || null;
                data.cilindraje = document.getElementById('v_cilindraje').value;
                data.foto_frontal = urls.f; data.foto_trasera = urls.r;
                data.foto_lado_derecho = urls.rd; data.foto_lado_izquierdo = urls.ri;
            } else {
                data.serial_motor = document.getElementById('v_serial_motor').value.trim() || null;
                data.foto_frontal = urls.f; data.foto_trasera = urls.r; data.foto_lateral = urls.l;
            }

            const { error } = await window.supabaseClient.from(tablaDestino).insert([data]);
            if (error) throw error;

            if (msg) { msg.textContent = '✅ Vehículo registrado exitosamente.'; msg.className = 'msg success'; msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 4000); }
            form.reset(); selectVehicleType('moto'); // Reset a moto
        } catch (err) {
            console.error('Error:', err);
            let mensaje = 'Error inesperado. Intente nuevamente.';
            if (err.message.includes('23505') || err.message.includes('unique')) mensaje = 'Esta placa ya se encuentra registrada.';
            else if (err.message.includes('storage')) mensaje = 'Error subiendo fotografías.';
            else if (err.message.includes('Falta la fotografía')) mensaje = err.message;
            mostrarError(mensaje);
        } finally { btn.disabled = false; btn.textContent = '✅ Registrar Vehículo'; }
    });
};
