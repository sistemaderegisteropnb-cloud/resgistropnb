window.initRegPersonas = function() {
    // ========================================================================
    // 🔹 1. FUNCIONES GLOBALES (para onchange en HTML)
    // ========================================================================
    
    // Helper para campos condicionales genéricos
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

    // Función específica para perforaciones
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

    // Función para convertir estatura: metros (1.60) → cm (160)
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
    // 🔹 2. LISTENERS DE ENTRADA Y VISTA PREVIA
    // ========================================================================
    
    // Listener para estatura en tiempo real
    const estaturaInput = document.getElementById('p_estatura');
    if (estaturaInput) {
        estaturaInput.addEventListener('input', window.convertirEstatura);
        estaturaInput.addEventListener('blur', window.convertirEstatura);
    }

    // Vista previa de imágenes
    const setupPreview = (inputId, previewId) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    };
    setupPreview('foto_frontal', 'prev_frontal');
    setupPreview('foto_perfil_izq', 'prev_izq');
    setupPreview('foto_perfil_der', 'prev_der');

    // Calcular edad automáticamente
    const fechaNac = document.getElementById('p_fecha_nac');
    const edadInput = document.getElementById('p_edad');
    if (fechaNac && edadInput) {
        fechaNac.addEventListener('change', () => {
            if (!fechaNac.value) return;
            const hoy = new Date();
            const nac = new Date(fechaNac.value);
            let edad = hoy.getFullYear() - nac.getFullYear();
            const m = hoy.getMonth() - nac.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
            edadInput.value = edad >= 0 ? edad : '';
        });
    }

    // Validaciones de entrada (solo números)
    const cedulaInput = document.getElementById('p_cedula');
    const tlfNumInput = document.getElementById('p_tlf_num');
    if (cedulaInput) cedulaInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8));
    if (tlfNumInput) tlfNumInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 7));

    // ========================================================================
    // 🔹 3. VALIDACIÓN EN TIEMPO REAL DE CÉDULA DUPLICADA
    // ========================================================================
    
    const cedulaStatus = document.getElementById('cedula-status');
    let cedulaCheckTimeout = null;

    async function verificarCedulaEnTiempoReal(cedula) {
        if (!cedulaStatus) return false;
        cedulaStatus.className = 'cedula-status checking';
        cedulaStatus.textContent = '🔍 Verificando...';
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
                cedulaStatus.innerHTML = '⚠️ Esta cédula ya está registrada';
                cedulaInput?.classList.add('cedula-duplicate');
                return true;
            } else {
                cedulaStatus.className = 'cedula-status success';
                cedulaStatus.textContent = '✅ Cédula disponible';
                cedulaInput?.classList.remove('cedula-duplicate');
                return false;
            }
        } catch (err) {
            console.warn('⚠️ No se pudo verificar cédula:', err.message);
            cedulaStatus.className = 'cedula-status';
            cedulaStatus.textContent = '';
            return false;
        }
    }

    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            const cedula = this.value.trim();
            if (cedula.length < 8) {
                if (cedulaStatus) {
                    cedulaStatus.className = 'cedula-status';
                    cedulaStatus.textContent = '';
                }
                this.classList.remove('cedula-duplicate');
                return;
            }
            if (cedulaCheckTimeout) clearTimeout(cedulaCheckTimeout);
            cedulaCheckTimeout = setTimeout(() => verificarCedulaEnTiempoReal(cedula), 500);
        });
        cedulaInput.addEventListener('blur', function() {
            const cedula = this.value.trim();
            if (cedula.length === 8) verificarCedulaEnTiempoReal(cedula);
        });
    }

    // ========================================================================
    // 🔹 4. ENVÍO DEL FORMULARIO
    // ========================================================================
    
    const form = document.getElementById('form-reg-personas');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-personas');

    if (!form || !btn) {
        console.error('❌ Formulario o botón no encontrado');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        // Verificación final de cédula antes de enviar
        const cedula = cedulaInput?.value.trim();
        if (cedula && cedula.length === 8) {
            const esDuplicada = await verificarCedulaEnTiempoReal(cedula);
            if (esDuplicada) {
                if (msg) {
                    msg.textContent = '❌ No se puede registrar: esta cédula ya existe en el sistema.';
                    msg.className = 'msg error';
                    msg.style.display = 'block';
                }
                cedulaInput?.focus();
                return;
            }
        }

        btn.disabled = true;
        btn.textContent = '⏳ Subiendo fotos y registrando...';
        if (msg) msg.style.display = 'none';

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
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo imagen: ' + error.message);
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            const urls = {
                front: await uploadFile(files.front, paths.front),
                izq: await uploadFile(files.izq, paths.izq),
                der: await uploadFile(files.der, paths.der)
            };

            // 2️⃣ Preparar datos con manejo seguro de opcionales
            const tlfCodRaw = document.getElementById('p_tlf_cod')?.value;
            const tlfNumRaw = document.getElementById('p_tlf_num')?.value.trim();
            // Si falta código O número, ambos son NULL (evita datos huérfanos)
            const tlfCodigo = (tlfCodRaw && tlfNumRaw) ? tlfCodRaw : null;
            const tlfNumero = (tlfCodRaw && tlfNumRaw) ? tlfNumRaw : null;

            const data = {
                estatus: document.getElementById('p_estatus')?.value || 'Verificación',
                estacion_policial: document.getElementById('p_estacion')?.value || null,
                foto_frontal: urls.front,
                foto_perfil_izq: urls.izq,
                foto_perfil_der: urls.der,
                primer_nombre: document.getElementById('p_nombre1')?.value.trim(),
                segundo_nombre: document.getElementById('p_nombre2')?.value.trim() || null,
                primer_apellido: document.getElementById('p_apellido1')?.value.trim(),
                segundo_apellido: document.getElementById('p_apellido2')?.value.trim() || null,
                cedula: cedulaInput?.value,
                fecha_nacimiento: document.getElementById('p_fecha_nac')?.value,
                edad: parseInt(document.getElementById('p_edad')?.value) || null,
                // ✅ Teléfono: o tiene los 2 valores, o es null
                tlf_codigo: tlfCodigo,
                tlf_numero: tlfNumero,
                direccion: document.getElementById('p_direccion')?.value.trim(),
                apodo: document.getElementById('p_apodo')?.value.trim() || null,
                marca_corporal: document.getElementById('p_marca')?.value.trim() || null,
                nacionalidad: document.getElementById('p_nacionalidad')?.value,
                sexo: document.getElementById('p_sexo')?.value,
                estatura_cm: window.convertirEstatura(),
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

            // 3️⃣ Guardar en Supabase
            const { error } = await window.supabaseClient.from('registro_personas').insert([data]);
            if (error) {
                // Manejo específico de errores de restricción
                if (error.code === '23505' || error.message?.includes('unique_cedula') || error.message?.includes('registro_personas_cedula_key')) {
                    throw new Error('Esta cédula ya está registrada en el sistema.');
                }
                if (error.message?.includes('tlf_numero_check')) {
                    throw new Error('Formato de teléfono inválido. Debe tener 7 dígitos o dejarse vacío.');
                }
                throw new Error(error.message || 'Error al guardar en la base de datos.');
            }

            // ✅ Éxito
            if (msg) {
                msg.textContent = '✅ Persona registrada exitosamente';
                msg.className = 'msg success';
                msg.style.display = 'block';
                // Auto-ocultar mensaje después de 4 segundos
                setTimeout(() => { if (msg) msg.style.display = 'none'; }, 4000);
            }
            form.reset();
            if (edadInput) edadInput.value = '';
            document.querySelectorAll('.hidden-field').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.img-preview').forEach(img => img.style.display = 'none');
            if (cedulaStatus) {
                cedulaStatus.className = 'cedula-status';
                cedulaStatus.textContent = '';
            }
            const estaturaCmHidden = document.getElementById('p_estatura_cm');
            if (estaturaCmHidden) estaturaCmHidden.value = '';
        } catch (err) {
            console.error('Error registro:', err);
            if (msg) {
                msg.textContent = '❌ ' + (err.message || 'Error desconocido');
                msg.className = 'msg error';
                msg.style.display = 'block';
            }
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Registrar Persona';
        }
    });
};
