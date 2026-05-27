window.initModPersonas = function() {
    // 🔹 Helpers globales
    window.toggleCampo = function(select, targetId) {
        const el = document.getElementById(targetId);
        const input = el?.querySelector('input');
        if (select.value === 'true') { if (el) el.style.display = 'block'; if (input) input.required = true; }
        else { if (el) el.style.display = 'none'; if (input) { input.value = ''; input.required = false; } }
    };
    window.activarCampoPerforacion = function(select) {
        const caja = document.getElementById('box-lugar-perforacion');
        const input = document.getElementById('txt_lugar_perforacion');
        if (!caja || !input) return;
        if (select.value === 'true') { caja.style.display = 'block'; input.required = true; }
        else { caja.style.display = 'none'; input.value = ''; input.required = false; }
    };
    window.convertirEstatura = function() {
        const m = document.getElementById('p_estatura')?.value;
        if (!m) return null;
        const val = parseFloat(m);
        return (!isNaN(val) && val >= 0.50 && val <= 2.30) ? Math.round(val * 100) : null;
    };
    const estInput = document.getElementById('p_estatura');
    if (estInput) estInput.addEventListener('input', window.convertirEstatura);

    // 🔹 Vista previa de imágenes
    const setupPreview = (idIn, idImg) => {
        const inp = document.getElementById(idIn);
        const img = document.getElementById(idImg);
        if (!inp || !img) return;
        inp.addEventListener('change', function() {
            const f = this.files[0];
            if (f) { const r = new FileReader(); r.onload = e => { img.src = e.target.result; img.style.display = 'block'; }; r.readAsDataURL(f); }
            else img.style.display = 'none';
        });
    };
    setupPreview('foto_frontal', 'prev_frontal');
    setupPreview('foto_perfil_izq', 'prev_izq');
    setupPreview('foto_perfil_der', 'prev_der');

    // 🔹 Búsqueda
    const buscarBtn = document.getElementById('btn-buscar');
    const buscarInput = document.getElementById('buscar-cedula');
    const form = document.getElementById('form-mod-personas');
    const msgBuscar = document.getElementById('buscar-msg');
    let currentId = null;
    let currentUrls = { front: '', izq: '', der: '' };

    const showBuscarMsg = (txt, type) => { msgBuscar.textContent = txt; msgBuscar.className = `search-msg ${type}`; msgBuscar.style.display = 'block'; };

    buscarBtn.addEventListener('click', async () => {
        const cedula = buscarInput.value.trim().replace(/\D/g, '');
        if (cedula.length < 7) { showBuscarMsg('⚠️ Ingrese entre 7 y 8 dígitos', 'error'); return; }
        showBuscarMsg('🔍 Buscando...', 'success');
        buscarBtn.disabled = true;

        try {
            const { data, error } = await window.supabaseClient.from('registro_personas').select('*').eq('cedula', cedula).single();
            if (error || !data) { showBuscarMsg('❌ Persona no encontrada en el sistema.', 'error'); form.style.display = 'none'; return; }

            currentId = data.id;
            currentUrls = { front: data.foto_frontal, izq: data.foto_perfil_izq, der: data.foto_perfil_der };
            document.getElementById('mod_record_id').value = currentId;

            document.getElementById('p_cedula').value = data.cedula;
            document.getElementById('p_nombre1').value = data.primer_nombre || '';
            document.getElementById('p_nombre2').value = data.segundo_nombre || '';
            document.getElementById('p_apellido1').value = data.primer_apellido || '';
            document.getElementById('p_apellido2').value = data.segundo_apellido || '';
            document.getElementById('p_fecha_nac').value = data.fecha_nacimiento || '';
            document.getElementById('p_edad').value = data.edad || '';
            document.getElementById('p_apodo').value = data.apodo || '';
            document.getElementById('p_marca').value = data.marca_corporal || '';
            document.getElementById('p_nacionalidad').value = data.nacionalidad || '';
            document.getElementById('p_sexo').value = data.sexo || '';
            document.getElementById('p_tlf_cod').value = data.tlf_codigo || '';
            document.getElementById('p_tlf_num').value = data.tlf_numero || '';
            document.getElementById('p_direccion').value = data.direccion || '';
            document.getElementById('p_estatura').value = data.estatura_cm ? (data.estatura_cm / 100).toFixed(2) : '';
            document.getElementById('p_color_piel').value = data.color_piel || '';
            document.getElementById('p_color_ojos').value = data.color_ojos || '';
            document.getElementById('p_color_cabello').value = data.color_cabello || '';
            document.getElementById('p_complexion').value = data.complexion || '';
            document.getElementById('p_estacion').value = data.estacion_policial || '';
            document.getElementById('p_observaciones').value = data.observaciones || '';

            const setCond = (selId, txtId, showId, val, detail) => {
                document.getElementById(selId).value = val ? 'true' : 'false';
                toggleCampo(document.getElementById(selId), showId);
                if (val && detail) document.getElementById(txtId).value = detail;
            };
            setCond('p_lentes', 'txt_lentes', 'det-lentes', data.usa_lentes, data.detalle_lentes);
            setCond('p_perforaciones', 'txt_lugar_perforacion', 'box-lugar-perforacion', data.perforaciones, data.detalle_perforaciones);
            setCond('p_cond_medica', 'txt_cond', 'det-cond', data.condicion_medica !== null, data.condicion_medica);
            setCond('p_medicamento', 'txt_med', 'det-med', data.consume_medicamento !== null, data.consume_medicamento);
            setCond('p_judicial', 'txt_jud', 'det-jud', data.problema_judicial !== null, data.problema_judicial);

            ['front', 'izq', 'der'].forEach(k => {
                const el = document.getElementById(k === 'front' ? 'prev_frontal' : k === 'izq' ? 'prev_izq' : 'prev_der');
                if (currentUrls[k]) { el.src = currentUrls[k]; el.style.display = 'block'; }
            });

            form.style.display = 'block';
            showBuscarMsg('✅ Registro cargado. Modifique y guarde.', 'success');
        } catch (err) {
            console.error(err);
            showBuscarMsg('❌ Error de conexión al buscar.', 'error');
        } finally {
            buscarBtn.disabled = false;
        }
    });

    // 🔹 Envío / Actualización
    const submitBtn = form?.querySelector('.btn-submit');
    const msgForm = document.getElementById('msg-mod-personas');
    const mostrarError = (txt) => { if(msgForm) { msgForm.textContent = '❌ ' + txt; msgForm.className = 'msg error'; msgForm.style.display = 'block'; } };

    if (form && submitBtn) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }
            if (!currentId) { mostrarError('Busque un registro primero.'); return; }

            const estCm = window.convertirEstatura();
            if (!estCm) { mostrarError('La estatura es obligatoria y debe estar entre 0.50 y 2.30 m.'); return; }

            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Guardando cambios...';
            if (msgForm) msgForm.style.display = 'none';

            try {
                const bucket = window.supabaseClient.storage.from('fotos_personas');
                const uploadIfChanged = async (fileInput, originalUrl) => {
                    const f = document.getElementById(fileInput).files[0];
                    if (!f) return originalUrl;
                    const uid = sessionStorage.getItem('pnb_user_id') || 'user';
                    const path = `${uid}/${Date.now()}_${fileInput}.jpg`;
                    const { error } = await bucket.upload(path, f, { cacheControl: '3600' });
                    if (error) throw new Error('Error subiendo imagen: ' + error.message);
                    return bucket.getPublicUrl(path).data.publicUrl;
                };

                const newFront = await uploadIfChanged('foto_frontal', currentUrls.front);
                const newIzq = await uploadIfChanged('foto_perfil_izq', currentUrls.izq);
                const newDer = await uploadIfChanged('foto_perfil_der', currentUrls.der);

                const tlfCod = document.getElementById('p_tlf_cod').value;
                const tlfNum = document.getElementById('p_tlf_num').value.trim();
                const tlfValido = tlfCod && tlfNum.length === 7;

                const updateData = {
                    foto_frontal: newFront, foto_perfil_izq: newIzq, foto_perfil_der: newDer,
                    primer_nombre: document.getElementById('p_nombre1').value.trim(),
                    segundo_nombre: document.getElementById('p_nombre2').value.trim() || null,
                    primer_apellido: document.getElementById('p_apellido1').value.trim(),
                    segundo_apellido: document.getElementById('p_apellido2').value.trim() || null,
                    fecha_nacimiento: document.getElementById('p_fecha_nac').value,
                    edad: parseInt(document.getElementById('p_edad').value) || null,
                    tlf_codigo: tlfValido ? tlfCod : null,
                    tlf_numero: tlfValido ? tlfNum : null,
                    direccion: document.getElementById('p_direccion').value.trim(),
                    apodo: document.getElementById('p_apodo').value.trim() || null,
                    marca_corporal: document.getElementById('p_marca').value.trim() || null,
                    nacionalidad: document.getElementById('p_nacionalidad').value,
                    sexo: document.getElementById('p_sexo').value,
                    estatura_cm: estCm,
                    color_piel: document.getElementById('p_color_piel').value,
                    color_ojos: document.getElementById('p_color_ojos').value,
                    color_cabello: document.getElementById('p_color_cabello').value,
                    complexion: document.getElementById('p_complexion').value,
                    usa_lentes: document.getElementById('p_lentes').value === 'true',
                    detalle_lentes: document.getElementById('p_lentes').value === 'true' ? document.getElementById('txt_lentes').value.trim() : null,
                    perforaciones: document.getElementById('p_perforaciones').value === 'true',
                    detalle_perforaciones: document.getElementById('p_perforaciones').value === 'true' ? document.getElementById('txt_lugar_perforacion').value.trim() : null,
                    condicion_medica: document.getElementById('p_cond_medica').value === 'true' ? document.getElementById('txt_cond').value : null,
                    consume_medicamento: document.getElementById('p_medicamento').value === 'true' ? document.getElementById('txt_med').value : null,
                    problema_judicial: document.getElementById('p_judicial').value === 'true' ? document.getElementById('txt_jud').value : null,
                    estacion_policial: document.getElementById('p_estacion').value,
                    observaciones: document.getElementById('p_observaciones').value.trim() || null
                };

                // ✅ .select() confirma que realmente se modificó la fila
                const { data, error } = await window.supabaseClient
                    .from('registro_personas')
                    .update(updateData)
                    .eq('id', currentId)
                    .select('id');

                if (error) throw error;
                if (!data || data.length === 0) throw new Error('No se pudo aplicar la actualización. Verifique permisos o conexión.');

                if (msgForm) {
                    msgForm.textContent = '✅ Cambios guardados correctamente en la base de datos.';
                    msgForm.className = 'msg success';
                    msgForm.style.display = 'block';
                }

                // Auto-reset después de 4s para limpiar la sesión de edición
                setTimeout(() => {
                    form.style.display = 'none';
                    buscarInput.value = '';
                    msgBuscar.style.display = 'none';
                    if (msgForm) msgForm.style.display = 'none';
                    currentId = null;
                }, 4000);

            } catch (err) {
                console.error('Error actualización:', err);
                let mensaje = 'Error al guardar cambios. Intente nuevamente.';
                if (err.message.includes('storage') || err.message.includes('upload')) mensaje = 'No se pudieron subir las fotografías nuevas.';
                else if (err.message.includes('cedula') || err.message.includes('23505')) mensaje = 'Conflicto con cédula existente.';
                else if (err.message.includes('not-null')) mensaje = 'Falta completar un campo obligatorio marcado.';
                mostrarError(mensaje);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Guardar Cambios';
            }
        });
    }
};
