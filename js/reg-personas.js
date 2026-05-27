window.initRegPersonas = function() {
    // ==========================================
    // 🔹 1. FUNCIONES GLOBALES (para onchange en HTML)
    // ==========================================
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

    // ==========================================
    // 🔹 2. LÓGICA DEL DROPDOWN DE BANDERAS
    // ==========================================
    const nativeSelect = document.getElementById('p_tlf_pais');
    const displayBox = document.querySelector('.phone-display');
    const optionsBox = document.querySelector('.phone-options');
    const flagImg = document.getElementById('tlf-flag-img');
    const codeText = document.getElementById('tlf-code-text');
    const countryText = document.getElementById('tlf-country-text');

    // Mapeo de país a código ISO de 2 letras para flagcdn.com
    const isoMap = { "Afganistán":"af","Albania":"al","Alemania":"de","Andorra":"ad","Angola":"ao","Antigua y Barbuda":"ag","Arabia Saudita":"sa","Argelia":"dz","Argentina":"ar","Armenia":"am","Australia":"au","Austria":"at","Azerbaiyán":"az","Bahamas":"bs","Baréin":"bh","Bangladés":"bd","Barbados":"bb","Bélgica":"be","Belice":"bz","Benín":"bj","Bielorrusia":"by","Birmania":"mm","Bolivia":"bo","Bosnia y Herzegovina":"ba","Botsuana":"bw","Brasil":"br","Brunéi":"bn","Bulgaria":"bg","Burkina Faso":"bf","Burundi":"bi","Bután":"bt","Cabo Verde":"cv","Camboya":"kh","Camerún":"cm","Canadá":"ca","Catar":"qa","Rep. Centroafricana":"cf","Chad":"td","Rep. Checa":"cz","Chile":"cl","China":"cn","Chipre":"cy","Colombia":"co","Comoras":"km","Corea del Norte":"kp","Corea del Sur":"kr","Costa de Marfil":"ci","Costa Rica":"cr","Croacia":"hr","Cuba":"cu","Dinamarca":"dk","Dominica":"dm","Ecuador":"ec","Egipto":"eg","El Salvador":"sv","Emiratos Árabes":"ae","Eritrea":"er","Eslovaquia":"sk","Eslovenia":"si","España":"es","Estados Unidos":"us","Estonia":"ee","Etiopía":"et","Filipinas":"ph","Finlandia":"fi","Fiyi":"fj","Francia":"fr","Gabón":"ga","Gambia":"gm","Georgia":"ge","Ghana":"gh","Granada":"gd","Grecia":"gr","Guatemala":"gt","Guinea":"gn","Guinea Ecuatorial":"gq","Guinea-Bisáu":"gw","Guyana":"gy","Haití":"ht","Honduras":"hn","Hungría":"hu","India":"in","Indonesia":"id","Irak":"iq","Irán":"ir","Irlanda":"ie","Islandia":"is","Israel":"il","Italia":"it","Jamaica":"jm","Japón":"jp","Jordania":"jo","Kazajistán":"kz","Kenia":"ke","Kirguistán":"kg","Kiribati":"ki","Kuwait":"kw","Laos":"la","Lesoto":"ls","Letonia":"lv","Líbano":"lb","Liberia":"lr","Libia":"ly","Liechtenstein":"li","Lituania":"lt","Luxemburgo":"lu","Macedonia del Norte":"mk","Madagascar":"mg","Malasia":"my","Malaui":"mw","Maldivas":"mv","Malí":"ml","Malta":"mt","Marruecos":"ma","Mauricio":"mu","Mauritania":"mr","México":"mx","Micronesia":"fm","Moldavia":"md","Mónaco":"mc","Mongolia":"mn","Montenegro":"me","Mozambique":"mz","Namibia":"na","Nauru":"nr","Nepal":"np","Nicaragua":"ni","Níger":"ne","Nigeria":"ng","Nueva Zelanda":"nz","Noruega":"no","Omán":"om","Países Bajos":"nl","Pakistán":"pk","Palaos":"pw","Palestina":"ps","Panamá":"pa","Papúa Nueva Guinea":"pg","Paraguay":"py","Perú":"pe","Polonia":"pl","Portugal":"pt","Reino Unido":"gb","Puerto Rico":"pr","Ruanda":"rw","Rumania":"ro","Rusia":"ru","Samoa":"ws","San Marino":"sm","Santa Lucía":"lc","Santo Tomé y Príncipe":"st","San Vicente y las Granadinas":"vc","Senegal":"sn","Serbia":"rs","Seychelles":"sc","Sierra Leona":"sl","Singapur":"sg","Siria":"sy","Somalia":"so","Sudáfrica":"za","Sudán":"sd","Sudán del Sur":"ss","Suecia":"se","Suiza":"ch","Surinam":"sr","Esuatini":"sz","Tayikistán":"tj","Tanzania":"tz","Tailandia":"th","Timor Oriental":"tl","Togo":"tg","Tonga":"to","Trinidad y Tobago":"tt","Túnez":"tn","Turquía":"tr","Turkmenistán":"tm","Tuvalu":"tv","Ucrania":"ua","Uganda":"ug","Uruguay":"uy","Uzbekistán":"uz","Vanuatu":"vu","Vaticano":"va","Venezuela":"ve","Vietnam":"vn","Yemen":"ye","Yibuti":"dj","Zambia":"zm","Zimbabue":"zw" };

    // Generar opciones visuales dinámicamente
    if (optionsBox && nativeSelect) {
        optionsBox.innerHTML = '';
        Array.from(nativeSelect.options).forEach(opt => {
            if (!opt.value) return;
            const iso = isoMap[opt.text] || opt.value.replace('+','').toLowerCase();
            const div = document.createElement('div');
            div.className = 'phone-option';
            div.innerHTML = `<img src="https://flagcdn.com/w20/${iso}.png" alt="${opt.text}"><span class="code">${opt.value}</span><span class="country">${opt.text}</span>`;
            div.addEventListener('click', () => {
                nativeSelect.value = opt.value;
                flagImg.src = `https://flagcdn.com/w20/${iso}.png`;
                codeText.textContent = opt.value;
                countryText.textContent = opt.text;
                optionsBox.style.display = 'none';
                nativeSelect.dispatchEvent(new Event('change'));
            });
            optionsBox.appendChild(div);
        });

        displayBox.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsBox.style.display = optionsBox.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.phone-dropdown-wrapper')) {
                optionsBox.style.display = 'none';
            }
        });
    }

    // ==========================================
    // 🔹 3. VISTA PREVIA DE IMÁGENES
    // ==========================================
    const setupPreview = (idIn, idImg) => {
        const input = document.getElementById(idIn);
        const preview = document.getElementById(idImg);
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

    // ==========================================
    // 🔹 4. CÁLCULO AUTOMÁTICO DE EDAD
    // ==========================================
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

    // ==========================================
    // 🔹 5. MÁSCARAS Y LISTENERS
    // ==========================================
    const cedulaInput = document.getElementById('p_cedula');
    const tlfNumInput = document.getElementById('p_tlf_num');
    if (cedulaInput) cedulaInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8));
    if (tlfPais && tlfNum.length < 1) { mostrarError('Ingrese al menos un dígito para el número.'); document.getElementById('p_tlf_num')?.focus(); return; }

    const estaturaInput = document.getElementById('p_estatura');
    if (estaturaInput) {
        estaturaInput.addEventListener('input', window.convertirEstatura);
        estaturaInput.addEventListener('blur', window.convertirEstatura);
    }

    // ==========================================
    // 🔹 6. VALIDACIÓN EN TIEMPO REAL DE CÉDULA
    // ==========================================
    const cedulaStatus = document.getElementById('cedula-status');
    let cedulaCheckTimeout = null;

    async function verificarCedula(cedula) {
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
                cedulaStatus.textContent = '⚠️ Esta cédula ya está registrada';
                cedulaInput?.classList.add('cedula-duplicate');
                return true;
            } else {
                cedulaStatus.className = 'cedula-status success';
                cedulaStatus.textContent = '✅ Cédula disponible';
                cedulaInput?.classList.remove('cedula-duplicate');
                return false;
            }
        } catch (err) {
            console.warn('⚠️ Verificación fallida:', err.message);
            cedulaStatus.className = 'cedula-status';
            cedulaStatus.textContent = '';
            return false;
        }
    }

    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            const val = this.value.trim();
            if (val.length < 7) {
                if (cedulaStatus) { cedulaStatus.className = 'cedula-status'; cedulaStatus.textContent = ''; }
                this.classList.remove('cedula-duplicate');
                return;
            }
            if (cedulaCheckTimeout) clearTimeout(cedulaCheckTimeout);
            cedulaCheckTimeout = setTimeout(() => verificarCedula(val), 500);
        });
        cedulaInput.addEventListener('blur', function() {
            if (this.value.trim().length >= 7) verificarCedula(this.value.trim());
        });
    }

    // ==========================================
    // 🔹 7. ENVÍO DEL FORMULARIO
    // ==========================================
    const form = document.getElementById('form-reg-personas');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-personas');

    const mostrarError = (texto) => {
        if (msg) { msg.textContent = '❌ ' + texto; msg.className = 'msg error'; msg.style.display = 'block'; }
    };

    if (!form || !btn) { console.error('❌ Formulario no encontrado'); return; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        // Validaciones previas estrictas
        const cedula = cedulaInput?.value.trim().replace(/\D/g, '');
        if (cedula.length < 7 || cedula.length > 8) { mostrarError('La cédula debe tener entre 7 y 8 dígitos.'); cedulaInput?.focus(); return; }

        const edad = parseInt(document.getElementById('p_edad')?.value);
        if (!document.getElementById('p_fecha_nac')?.value || isNaN(edad) || edad < 0 || edad > 120) { mostrarError('Verifique la fecha de nacimiento.'); document.getElementById('p_fecha_nac')?.focus(); return; }

        const estCm = window.convertirEstatura();
        if (!estCm || estCm < 50 || estCm > 230) { mostrarError('Estatura inválida (0.50m - 2.30m).'); document.getElementById('p_estatura')?.focus(); return; }

        const tlfPais = document.getElementById('p_tlf_pais')?.value;
        const tlfNum = document.getElementById('p_tlf_num')?.value.trim().replace(/\D/g, '');
        if (tlfPais && tlfNum.length < 5) { mostrarError('El número de teléfono debe tener al menos 5 dígitos.'); document.getElementById('p_tlf_num')?.focus(); return; }

        if (await verificarCedula(cedula)) { mostrarError('Esta cédula ya está registrada.'); cedulaInput?.focus(); return; }

        // Iniciar carga
        btn.disabled = true;
        btn.textContent = '⏳ Guardando...';
        if (msg) msg.style.display = 'none';

        try {
            // 1. Subir fotos a Supabase Storage
            const bucket = window.supabaseClient.storage.from('fotos_personas');
            const files = {
                front: document.getElementById('foto_frontal').files[0],
                izq: document.getElementById('foto_perfil_izq').files[0],
                der: document.getElementById('foto_perfil_der').files[0]
            };
            if (!files.front || !files.izq || !files.der) throw new Error('Las 3 fotografías son obligatorias.');

            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();
            const paths = { f: `${uid}/${ts}_f.jpg`, i: `${uid}/${ts}_i.jpg`, d: `${uid}/${ts}_d.jpg` };

            const uploadFile = async (file, path) => {
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo imágenes. Verifique su conexión.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            const urls = {
                front: await uploadFile(files.front, paths.f),
                izq: await uploadFile(files.izq, paths.i),
                der: await uploadFile(files.der, paths.d)
            };

            // 2. Preparar datos para BD
            const data = {
                estatus: 'Verificación',
                estacion_policial: document.getElementById('p_estacion')?.value || null,
                direccion_detencion: document.getElementById('p_direccion_detencion')?.value.trim() || null,
                foto_frontal: urls.front, foto_perfil_izq: urls.izq, foto_perfil_der: urls.der,
                primer_nombre: document.getElementById('p_nombre1')?.value.trim(),
                segundo_nombre: document.getElementById('p_nombre2')?.value.trim() || null,
                primer_apellido: document.getElementById('p_apellido1')?.value.trim(),
                segundo_apellido: document.getElementById('p_apellido2')?.value.trim() || null,
                cedula: cedula,
                fecha_nacimiento: document.getElementById('p_fecha_nac')?.value,
                edad: edad,
                tlf_pais: tlfPais || null,
                tlf_numero: (tlfPais && tlfNum) ? tlfNum : null,
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

            // 3. Insertar en Supabase
            const { error } = await window.supabaseClient.from('registro_personas').insert([data]);
            if (error) throw error;

            // 4. Éxito y limpieza
            if (msg) {
                msg.textContent = '✅ Registro guardado exitosamente.';
                msg.className = 'msg success';
                msg.style.display = 'block';
                setTimeout(() => { if (msg) msg.style.display = 'none'; }, 5000);
            }
            form.reset();
            if (edadInput) edadInput.value = '';
            document.querySelectorAll('.hidden-field').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.img-preview').forEach(img => img.style.display = 'none');
            if (cedulaStatus) { cedulaStatus.className = 'cedula-status'; cedulaStatus.textContent = ''; }
            // Resetear dropdown de teléfono
            if (nativeSelect) nativeSelect.value = '';
            flagImg.src = 'https://flagcdn.com/w20/xx.png';
            codeText.textContent = '+XX';
            countryText.textContent = 'Seleccione código';

        } catch (err) {
            console.error('Error registro:', err);
            let mensaje = 'Ocurrió un error inesperado. Intente nuevamente.';
            const raw = err.message || '';
            if (raw.includes('cedula') || raw.includes('23505')) mensaje = 'Esta cédula ya está registrada.';
            else if (raw.includes('tlf') || raw.includes('check')) mensaje = 'Formato de teléfono inválido o incompleto.';
            else if (raw.includes('storage') || raw.includes('upload')) mensaje = 'Error subiendo fotografías. Verifique tamaño/conexión.';
            else if (raw.includes('not-null')) mensaje = 'Falta completar un campo obligatorio.';
            mostrarError(mensaje);
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Registrar Persona';
        }
    });
};
