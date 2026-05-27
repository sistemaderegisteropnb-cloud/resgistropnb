window.initRegPersonas = function() {
    // 🔹 Helper para campos condicionales
    window.toggleCampo = function(select, targetId) {
        const el = document.getElementById(targetId);
        const input = el.querySelector('input');
        if (select.value === 'true') {
            el.style.display = 'block';
            if (input) input.required = true;
        } else {
            el.style.display = 'none';
            if (input) { input.value = ''; input.required = false; }
        }
    };

    // 🔹 Calcular edad automáticamente
    const fechaNac = document.getElementById('p_fecha_nac');
    const edadInput = document.getElementById('p_edad');
    fechaNac.addEventListener('change', () => {
        if (!fechaNac.value) return;
        const hoy = new Date();
        const nac = new Date(fechaNac.value);
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        edadInput.value = edad >= 0 ? edad : '';
    });

    // 🔹 Validaciones de entrada (solo números)
    document.getElementById('p_cedula').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8));
    document.getElementById('p_tlf_num').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 7));

    // 🔹 Envío del formulario
    const form = document.getElementById('form-reg-personas');
    const btn = form.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-personas');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Validación manual rápida para asegurar que no se salten campos
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ Subiendo fotos y registrando...';
        msg.style.display = 'none';

        try {
            // 1️⃣ Subir fotos a Supabase Storage
            const bucket = window.supabaseClient.storage.from('fotos_personas');
            const files = {
                front: document.getElementById('foto_frontal').files[0],
                izq: document.getElementById('foto_perfil_izq').files[0],
                der: document.getElementById('foto_perfil_der').files[0]
            };
            if (!files.front || !files.izq || !files.der) throw new Error('Las 3 fotografías son obligatorias.');

            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();
            const paths = {
                front: `${uid}/${ts}_f.jpg`,
                izq: `${uid}/${ts}_i.jpg`,
                der: `${uid}/${ts}_d.jpg`
            };

            const uploadFile = async (file, path) => {
                const { error } = await bucket.upload(path, file, { cacheControl: '3600', upsert: false });
                if (error) throw new Error('Error subiendo imagen: ' + error.message);
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            const urls = {
                front: await uploadFile(files.front, paths.front),
                izq: await uploadFile(files.izq, paths.izq),
                der: await uploadFile(files.der, paths.der)
            };

            // 2️⃣ Preparar datos
            const data = {
                foto_frontal: urls.front, foto_perfil_izq: urls.izq, foto_perfil_der: urls.der,
                primer_nombre: document.getElementById('p_nombre1').value.trim(),
                segundo_nombre: document.getElementById('p_nombre2').value.trim() || null,
                primer_apellido: document.getElementById('p_apellido1').value.trim(),
                segundo_apellido: document.getElementById('p_apellido2').value.trim() || null,
                cedula: document.getElementById('p_cedula').value,
                fecha_nacimiento: document.getElementById('p_fecha_nac').value,
                edad: parseInt(edadInput.value),
                tlf_codigo: document.getElementById('p_tlf_cod').value,
                tlf_numero: document.getElementById('p_tlf_num').value,
                direccion: document.getElementById('p_direccion').value.trim(),
                apodo: document.getElementById('p_apodo').value.trim() || null,
                marca_corporal: document.getElementById('p_marca').value.trim() || null,
                nacionalidad: document.getElementById('p_nacionalidad').value,
                sexo: document.getElementById('p_sexo').value,
                estatura_cm: parseFloat(document.getElementById('p_estatura').value),
                color_piel: document.getElementById('p_color_piel').value,
                color_ojos: document.getElementById('p_color_ojos').value,
                color_cabello: document.getElementById('p_color_cabello').value,
                complexion: document.getElementById('p_complexion').value,
                usa_lentes: document.getElementById('p_lentes').value === 'true',
                perforaciones: document.getElementById('p_perforaciones').value === 'true',
                condicion_medica: document.getElementById('p_cond_medica').value === 'true' ? document.getElementById('txt_cond').value : null,
                consume_medicamento: document.getElementById('p_medicamento').value === 'true' ? document.getElementById('txt_med').value : null,
                problema_judicial: document.getElementById('p_judicial').value === 'true' ? document.getElementById('txt_jud').value : null,
                observaciones: document.getElementById('p_observaciones').value.trim() || null
            };

            // 3️⃣ Guardar en Supabase
            const { error } = await window.supabaseClient.from('registro_personas').insert([data]);
            if (error) throw new Error(error.message || 'Error al guardar en BD.');

            msg.textContent = '✅ Persona registrada exitosamente';
            msg.className = 'msg success';
            msg.style.display = 'block';
            form.reset();
            edadInput.value = '';
            document.querySelectorAll('.hidden-field').forEach(el => el.style.display = 'none');
        } catch (err) {
            console.error('Error registro:', err);
            msg.textContent = '❌ ' + (err.message || 'Error desconocido');
            msg.className = 'msg error';
            msg.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Registrar Persona';
        }
    });
};
