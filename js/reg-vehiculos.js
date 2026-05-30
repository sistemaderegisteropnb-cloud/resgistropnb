window.initRegVehiculos = function() {
    // 🔹 1. Llenar Select de Años (1850 -> Hoy)
    const anioSelect = document.getElementById('v_anio');
    if (anioSelect) {
        const currentYear = new Date().getFullYear();
        anioSelect.innerHTML = '<option value="">Seleccione año...</option>';
        for (let y = currentYear; y >= 1850; y--) {
            anioSelect.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }

    // 🔹 2. Selector de Tipo (Moto/Auto)
    window.selectVehicleType = function(type) {
        document.querySelectorAll('.tipo-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        document.getElementById('v_tipo').value = (type === 'moto') ? 'Motocicleta' : 'Automóvil';
        
        // Lógica para mostrar/ocultar campos específicos (por ahora solo Moto está completo)
        const fotosMoto = document.getElementById('sec-fotos-moto');
        if (type === 'moto') {
            fotosMoto.style.display = 'block';
            fotosMoto.querySelector('legend').textContent = '📸 Fotografías (Motocicleta)';
        } else {
            // Aquí podrías ocultar fotos de moto y mostrar otras para auto
            // Por simplicidad, mantenemos visibles o adaptamos
            fotosMoto.style.display = 'block'; 
            fotosMoto.querySelector('legend').textContent = '📸 Fotografías';
        }
    };

    // 🔹 3. Vista Previa de Imágenes
    const setupPreview = (inputId, previewId) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
                reader.readAsDataURL(file);
            } else { preview.style.display = 'none'; }
        });
    };
    // Fotos Motos (4 vistas)
    setupPreview('v_foto_frontal', 'prev_v_frontal');
    setupPreview('v_foto_trasera', 'prev_v_trasera');
    setupPreview('v_foto_der', 'prev_v_der');
    setupPreview('v_foto_izq', 'prev_v_izq');

    // 🔹 4. Envío del Formulario
    const form = document.getElementById('form-reg-vehiculos');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-vehiculos');

    const mostrarError = (texto) => {
        if (msg) { msg.textContent = '❌ ' + texto; msg.className = 'msg error'; msg.style.display = 'block'; }
    };

    if (!form || !btn) { console.error('❌ Formulario no encontrado'); return; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const placa = document.getElementById('v_placa').value.trim().toUpperCase();
        if (placa.length < 5) { mostrarError('Verifique la placa.'); return; }

        btn.disabled = true;
        btn.textContent = '⏳ Guardando...';
        if (msg) msg.style.display = 'none';

        try {
            // 1. Subir Fotos
            const bucket = window.supabaseClient.storage.from('fotos_vehiculos');
            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();
            
            // Helper para subir
            const uploadFile = async (inputId, suffix) => {
                const file = document.getElementById(inputId).files[0];
                if (!file) throw new Error('Todas las fotografías son obligatorias.');
                const path = `${uid}/${ts}_${suffix}.jpg`;
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo imagen.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            // Subir las 4 fotos en paralelo
            const urls = await Promise.all([
                uploadFile('v_foto_frontal', 'f'),
                uploadFile('v_foto_trasera', 't'),
                uploadFile('v_foto_der', 'r'),  // Right
                uploadFile('v_foto_izq', 'l')   // Left
            ]);

            // 2. Datos a Insertar
            const data = {
                estatus: 'Verificación',
                estacion_policial: document.getElementById('v_estacion')?.value || sessionStorage.getItem('pnb_estacion') || 'EPP GENERICA', // Fallback si no hay campo
                placa: placa,
                marca: document.getElementById('v_marca').value.trim(),
                modelo: document.getElementById('v_modelo').value.trim(),
                anio: parseInt(document.getElementById('v_anio').value),
                color: document.getElementById('v_color').value.trim(),
                tipo_vehiculo: document.getElementById('v_tipo').value,
                serial_carroceria: document.getElementById('v_serial_carroceria').value.trim(),
                serial_motor: document.getElementById('v_serial_motor').value.trim(),
                cilindraje: document.getElementById('v_cilindraje').value,
                observaciones: document.getElementById('v_observaciones').value.trim() || null,
                
                // URLs de fotos
                foto_frontal: urls[0],
                foto_trasera: urls[1],
                foto_lado_derecho: urls[2],
                foto_lado_izquierdo: urls[3]
            };

            // 3. Insertar en Supabase
            const { error } = await window.supabaseClient.from('registro_vehiculos').insert([data]);
            if (error) throw error;

            // Éxito
            if (msg) {
                msg.textContent = '✅ Vehículo registrado exitosamente.';
                msg.className = 'msg success';
                msg.style.display = 'block';
                setTimeout(() => msg.style.display = 'none', 4000);
            }
            
            // Reset
            form.reset();
            document.querySelectorAll('.img-preview').forEach(img => img.style.display = 'none');
            document.getElementById('v_anio').selectedIndex = 0; // Reset año
            selectVehicleType('moto'); // Reset tipo a moto por defecto

        } catch (err) {
            console.error('Error:', err);
            let mensaje = 'Error inesperado. Intente nuevamente.';
            if (err.message.includes('23505') || err.message.includes('unique')) mensaje = 'Esta placa ya se encuentra registrada.';
            else if (err.message.includes('storage')) mensaje = 'Error subiendo fotografías. Verifique su conexión.';
            else if (err.message.includes('Todas las fotografías')) mensaje = 'Debe cargar las 4 fotografías requeridas.';
            mostrarError(mensaje);
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Registrar Vehículo';
        }
    });
};
