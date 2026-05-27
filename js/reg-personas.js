window.initRegPersonas = function() {
    // ========================================================================
    // 🔹 1. FUNCIONES GLOBALES (para onchange en HTML)
    // ========================================================================
    
    window.toggleCampo = function(select, targetId) {
        const el = document.getElementById(targetId);
        const input = el?.querySelector('input');
        if (select.value === 'true') {
            if (el) el.style.display = 'block';
            if (input) input.required = true;
        } else {
            if (el) el.style.display = 'none';
            if (input) { input.value = ''; input.required = false; }
        }
    };

    window.activarCampoPerforacion = function(select) {
        const caja = document.getElementById('box-lugar-perforacion');
        const input = document.getElementById('txt_lugar_perforacion');
        if (!caja || !input) return;
        if (select.value === 'true') {
            caja.style.display = 'block';
            input.required = true;
        } else {
            caja.style.display = 'none';
            input.value = '';
            input.required = false;
        }
    };

    window.convertirEstatura = function() {
        const inputM = document.getElementById('p_estatura');
        const inputCm = document.getElementById('p_estatura_cm');
        if (!inputM) return null;
        const metros = parseFloat(inputM.value);
        if (!isNaN(metros) && metros >= 0.50 && metros <= 2.30) {
            const cm = Math.round(metros * 100);
            if (inputCm) inputCm.value = cm;
            return cm;
        }
        return null;
    };

    // ========================================================================
    // 🔹 2. LISTENERS Y VISTA PREVIA
    // ========================================================================
    
    const estaturaInput = document.getElementById('p_estatura');
    if (estaturaInput) {
        estaturaInput.addEventListener('input', window.convertirEstatura);
        estaturaInput.addEventListener('blur', window.convertirEstatura);
    }

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
    setupPreview('foto_frontal', 'prev_frontal');
    setupPreview('foto_perfil_izq', 'prev_izq');
    setupPreview('foto_perfil_der', 'prev_der');

    const fechaNac = document.getElementById('p_fecha_nac');
    const edadInput = document.getElementById('p_edad');
    if (fechaNac && edadInput) {
        fechaNac.addEventListener('change', () => {
            if (!fechaNac.value) { edadInput.value = ''; return; }
            const hoy = new Date();
            const nac = new Date(fechaNac.value);
            let edad = hoy.getFullYear() - nac.getFullYear();
            const m = hoy.getMonth() - nac.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
            edadInput.value = (edad >= 0 && edad <= 120) ? edad : '';
        });
    }

    const cedulaInput = document.getElementById('p_cedula');
    const tlfNumInput = document.getElementById('p_tlf_num');
    if (cedulaInput) cedulaInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8));
    if (tlfNumInput) tlfNumInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 7));

    // ========================================================================
    // 🔹 3. VALIDACIÓN EN TIEMPO REAL DE CÉDULA
    // ========================================================================
    const cedulaStatus = document.getElementById('cedula-status');
    let cedulaCheckTimeout = null;

    async function verificarCedula(cedula) {
        if (!cedulaStatus) return false;
        cedulaStatus.className = 'cedula-status checking';
        cedulaStatus.textContent = '🔍 Verificando disponibilidad...';
        cedulaInput?.classList.remove('cedula-duplicate');

        try {
            const { data, error } = await window.supabaseClient
                .from('registro_personas')
                .select('cedula')
                .eq('cedula', cedula)
                .maybeSingle();
            if (error) throw error;

            if (data) {
                cedulaStatus.className = 'cedula-status error';
                cedulaStatus.textContent = '⚠️ Esta cédula ya se encuentra registrada';
                cedulaInput?.classList.add('cedula-duplicate');
                return true;
            } else {
                cedulaStatus.className = 'cedula-status success';
                cedulaStatus.textContent = '✅ Cédula disponible para registro';
                cedulaInput?.classList.remove('cedula-duplicate');
                return false;
            }
        } catch (err) {
            console.warn('⚠️ Verificación de cédula no disponible:', err.message);
            cedulaStatus.className = 'cedula-status';
            cedulaStatus.textContent = '';
            return false;
        }
    }

    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            const val = this.value.trim();
            if (val.length < 8) {
                if (cedulaStatus) { cedulaStatus.className = 'cedula-status'; cedulaStatus.textContent = ''; }
                this.classList.remove('cedula-duplicate');
                return;
            }
            if (cedulaCheckTimeout) clearTimeout(cedulaCheckTimeout);
            cedulaCheckTimeout = setTimeout(() => verificarCedula(val), 600);
        });
        cedulaInput.addEventListener('blur', function() {
            if (this.value.trim().length === 8) verificarCedula(this.value.trim());
        });
    }

    // ========================================================================
    // 🔹 4. ENVÍO DEL FORMULARIO + MENSAJES AMIGABLES
    // ========================================================================
    const form = document.getElementById('form-reg-personas');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-personas');

    // Helper para mostrar errores
    const mostrarError = (texto) => {
        if (msg) {
            msg.textContent = '❌ ' + texto;
            msg.className = 'msg error';
            msg.style.display = 'block';
        }
    };

    if (!form || !btn) { console.error('❌ Elementos del formulario no encontrados'); return; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        // ✅ 1. VALIDACIONES PREVIAS (Evitan errores de BD)
        const cedulaLimpia = cedulaInput?.value.trim().replace(/\D/g, '');
        if (cedulaLimpia.length !== 8) {
            mostrarError('La cédula debe contener exactamente 8 números. Por favor, verifica el dato.');
            cedulaInput?.focus();
            return;
        }

        const edad = parseInt(document.getElementById('p_edad')?.value);
        if (!document.getElementById('p_fecha_nac')?.value || isNaN(edad) || edad < 0 || edad > 120) {
            mostrarError('No se pudo calcular la edad. Revisa la fecha de nacimiento e intenta nuevamente.');
            document.getElementById('p_fecha_nac')?.focus();
            return;
        }

        const estCm = window.convertirEstatura();
        if (!estCm || estCm < 50 || estCm > 230) {
            mostrarError('La estatura debe estar entre 0.50 m y 2.30 m. Por favor, corrige el valor.');
            document.getElementById('p_estatura')?.focus();
            return;
        }

        const tlfCod = document.getElementById('p_tlf_cod')?.value;
        const tlfNum = document.getElementById('p_tlf_num')?.value.trim();
        if (tlfCod && tlfNum.length !== 7) {
            mostrarError('Si ingresaste un teléfono, debe tener exactamente 7 dígitos. Si no lo conoces, déjalo en blanco.');
            document.getElementById('p_tlf_num')?.focus();
            return;
        }

        // Verificación final de cédula duplicada
        if (await verificarCedula(cedulaLimpia)) {
            mostrarError('Este número de cédula ya se encuentra registrado en nuestro sistema.');
            cedulaInput?.focus();
            return;
        }

        // ✅ 2. PROCESO DE ENVÍO
        btn.disabled = true;
        btn.textContent = '⏳ Guardando registro en el sistema...';
        if (msg) msg.style.display = 'none';

        try {
            const bucket = window.supabaseClient.storage.from('fotos_personas');
            const files = {
                front: document.getElementById('foto_frontal').files[0],
                izq: document.getElementById('foto_perfil_izq').files[0],
                der: document.getElementById('foto_perfil_der').files[0]
            };
            if (!files.front || !files.izq || !files.der) {
                throw new Error('Es obligatorio adjuntar las tres fotografías (frontal y ambos perfiles).');
            }

            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();
            const paths = { f: `${uid}/${ts}_f.jpg`, i: `${uid}/${ts}_i.jpg`, d: `${uid}/${ts}_d.jpg` };

            const uploadFile = async (file, path) => {
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error al subir las imágenes. Verifica tu conexión e intenta de nuevo.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            const urls = {
                front: await uploadFile(files.front, paths.f),
                izq: await uploadFile(files.izq, paths.i),
                der: await uploadFile(files.der, paths.d)
            };

            const data = {
                estatus: 'Verificación',
                estacion_policial: document.getElementById('p_estacion')?.value || null,
                foto_frontal: urls.front, foto_perfil_izq: urls.izq, foto_perfil_der: urls.der,
                primer_nombre: document.getElementById('p_nombre1')?.value.trim(),
                segundo_nombre: document.getElementById('p_nombre2')?.value.trim() || null,
                primer_apellido: document.getElementById('p_apellido1')?.value.trim(),
                segundo_apellido: document.getElementById('p_apellido2')?.value.trim() || null,
                cedula: cedulaLimpia, // ✅ Solo 8 dígitos, sin letras ni guiones
                fecha_nacimiento: document.getElementById('p_fecha_nac')?.value,
                edad: edad,
                tlf_codigo: (tlfCod && tlfNum.length === 7) ? tlfCod : null,
                tlf_numero: (tlfCod && tlfNum.length === 7) ? tlfNum : null,
                direccion: document.getElementById('p_direccion')?.value.trim(),
                apodo: document.getElementById('p_apodo')?.value.trim() || null,
                marca_corporal: document.getElementById('p_marca')?.value.trim() || null,
                nacionalidad: document.getElementById('p_nacionalidad')?.value,
                sexo: document.getElementById('p_sexo')?.value,
                estatura_cm: estCm,
                color_piel: document.getElementById('p_color_piel')?.value,
                color_ojos: document.getElementById('p_color_ojos')?.value,
                color_cabello: document.getElementById('p_color_cabello')?.value,
                complexion: document.getElementById('p_complexion')?.value,
                usa_lentes: document.getElementById('p_lentes')?.value === 'true',
                detalle_lentes: document.getElementById('p_lentes')?.value === 'true' ? document.getElementById('txt_lentes')?.value.trim() : null,
                perforaciones: document.getElementById('p_perforaciones')?.value === 'true',
                detalle_perforaciones: document.getElementById('p_perforaciones')?.value === 'true' ? document.getElementById('txt_lugar_perforacion')?.value.trim() : null,
                condicion_medica: document.getElementById('p_cond_medica')?.value === 'true' ? document.getElementById('txt_cond')?.value : null,
                consume_medicamento: document.getElementById('p_medicamento')?.value === 'true' ? document.getElementById('txt_med')?.value : null,
                problema_judicial: document.getElementById('p_judicial')?.value === 'true' ? document.getElementById('txt_jud')?.value : null,
                observaciones: document.getElementById('p_observaciones')?.value.trim() || null
            };

            const { error } = await window.supabaseClient.from('registro_personas').insert([data]);
            
            if (error) throw error; // Lanzar al catch para mapeo amigable

            // ✅ ÉXITO
            if (msg) {
                msg.textContent = '✅ Registro guardado exitosamente en el sistema.';
                msg.className = 'msg success';
                msg.style.display = 'block';
                setTimeout(() => { if(msg) msg.style.display = 'none'; }, 5000);
            }
            form.reset();
            if (edadInput) edadInput.value = '';
            document.querySelectorAll('.hidden-field').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.img-preview').forEach(img => img.style.display = 'none');
            if (cedulaStatus) { cedulaStatus.className = 'cedula-status'; cedulaStatus.textContent = ''; }
            const estCmHidden = document.getElementById('p_estatura_cm');
            if (estCmHidden) estCmHidden.value = '';

        } catch (err) {
            console.error('Error registro:', err);
            
            // 🎯 TRADUCTOR DE ERRORES DB → MENSAJES AMIGABLES
            const rawMsg = err.message || err.code || '';
            let mensajeFinal = 'Ocurrió un error inesperado al guardar. Por favor, verifica tu conexión e intenta nuevamente.';

            if (rawMsg.includes('cedula_check') || rawMsg.includes('23514')) {
                mensajeFinal = 'El formato de la cédula no es válido. Debe contener exactamente 8 números.';
            } else if (rawMsg.includes('unique_cedula') || rawMsg.includes('23505')) {
                mensajeFinal = 'Esta cédula ya se encuentra registrada en nuestro sistema.';
            } else if (rawMsg.includes('edad') || rawMsg.includes('not-null') || rawMsg.includes('23502')) {
                mensajeFinal = 'Falta información obligatoria. Por favor, completa la fecha de nacimiento y los campos marcados.';
            } else if (rawMsg.includes('tlf_numero_check')) {
                mensajeFinal = 'El teléfono debe tener 7 dígitos exactos. Si no lo tienes, déjalo en blanco.';
            } else if (rawMsg.includes('estatura')) {
                mensajeFinal = 'La estatura debe estar entre 0.50 m y 2.30 m.';
            } else if (rawMsg.includes('storage') || rawMsg.includes('upload')) {
                mensajeFinal = 'No se pudieron subir las fotografías. Verifica el tamaño (máx. 5MB) e intenta de nuevo.';
            } else if (err.message.includes('Es obligatorio adjuntar')) {
                mensajeFinal = err.message;
            }

            mostrarError(mensajeFinal);
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Registrar Persona';
        }
    });
};
