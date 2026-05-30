window.initModVehiculos = function() {
    // 🔹 LISTAS DE MARCAS/MODELOS (IGUAL QUE REGISTRO)
    const marcasModelosMoto = {
        "Empire Keeway": ["Matrix Lite", "Matrix II 150", "EK Xpress Lite", "QJ Fort", "Horse (EK Horse 2 SE)", "EK Arsen II 200", "EK Atlas", "Owen 200", "Thunder EK", "TX II 150", "TX 250GS", "V302C"],
        "Bera Motorcycles": ["Bera BWS", "Milán", "Runner", "SBR", "X1", "BRF", "León", "BR200 / DT", "Cobra", "Kavak", "BRZ", "GR", "Antiking"],
        "Motos Toro": ["Toro Jaguar TR150cc", "Toro León TR200cc", "Toro TRX 150", "Toro TRX 250", "Toro Cappuccino TR180cc", "Toro Power TR180cc", "Toro Moka 150", "Toro Fox TR180cc", "Toro REX TR150cc", "Toro REX TR250cc"],
        "Yamaha": ["Yamaha YBR 125", "Yamaha FZ16", "Yamaha FZ-S", "Yamaha MT-03", "Yamaha XTZ 125", "Yamaha XTZ 150", "Yamaha XTZ 250 Lander"],
        "Honda": ["Honda CG 150 Titan", "Honda CB 125F", "Honda CB 190R", "Honda XR 150L", "Honda XR 190L", "Honda PCX 160", "Honda ADV 160"],
        "Suzuki": ["Suzuki GN 125", "Suzuki AX 100", "Suzuki DR 150", "Suzuki Gixxer 150", "Suzuki V-Strom 250"],
        "Otra": ["Otra"]
    };

    const marcasModelosAuto = {
        "Toyota": ["Corolla", "Yaris", "Hilux", "Fortuner", "Camry", "Land Cruiser", "Prado", "Rav4", "HiAce"],
        "Chevrolet": ["Aveo", "Spark", "Cruze", "Tracker", "Captiva", "Orlando", "Silverado", "Colorado", "Sail"],
        "Ford": ["Fiesta", "Focus", "Ranger", "F-150", "Explorer", "Escape", "EcoSport", "Territory"],
        "Hyundai": ["Tucson", "Creta", "Accent", "Elantra", "Santa Fe", "Kona", "Grand i10", "H100"],
        "Kia": ["Picanto", "Soluto", "Seltos", "Sportage", "Sorento", "Rio", "Cerato", "K2700"],
        "Renault": ["Logan", "Sandero", "Duster", "Kwid", "Oroch", "Koleos", "Clio", "Master"],
        "Fiat": ["Cronos", "Argo", "Toro", "Mobi", "Strada", "Fiorino", "Pulse", "Uno"],
        "JAC Motors": ["Arena", "Aventura", "Nevado", "Tepuy", "La Venezolana", "J7", "Refine", "Sunray"],
        "Changan Auto": ["Alsvin", "CS15", "CS35 Plus", "CS55 Plus", "CS75 Plus", "Uni-T", "Uni-V", "Hunter"],
        "Nissan": ["Versa", "Sentra", "Frontier", "Pathfinder", "X-Trail", "Kicks", "NP300"],
        "Otra": ["Otra"]
    };

    // 🔹 Referencias DOM
    const marcaSelect = document.getElementById('m_marca');
    const modeloSelect = document.getElementById('m_modelo');
    const anioSelect = document.getElementById('m_anio');
    const form = document.getElementById('form-mod-vehiculos');
    const btnBuscar = document.getElementById('btn_buscar_mod');
    const msgBox = document.getElementById('msg_mod_vehiculos');
    const msgBusqueda = document.getElementById('mod_msg_busqueda');

    let currentData = null; // Para guardar datos actuales y URLs de fotos
    let currentTable = ''; // 'registro_motos' o 'registro_automoviles'

    // 🔹 1. Poblar Años
    if (anioSelect) {
        const currentYear = new Date().getFullYear();
        anioSelect.innerHTML = '<option value="">Seleccione año...</option>';
        for (let y = currentYear; y >= 1850; y--) anioSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }

    // 🔹 2. Lógica de Marcas/Modelos
    function cargarMarcas(tipo) {
        const lista = tipo === 'moto' ? marcasModelosMoto : marcasModelosAuto;
        marcaSelect.innerHTML = '<option value="">Seleccione marca...</option>';
        Object.keys(lista).sort().forEach(m => marcaSelect.innerHTML += `<option value="${m}">${m}</option>`);
        modeloSelect.innerHTML = '<option value="">Seleccione modelo...</option>';
    }

    marcaSelect.addEventListener('change', function() {
        const tipo = document.getElementById('mod_tipo_vehiculo').value === 'Motocicleta' ? 'moto' : 'auto';
        const lista = tipo === 'moto' ? marcasModelosMoto : marcasModelosAuto;
        const marca = this.value;
        modeloSelect.innerHTML = '<option value="">Seleccione modelo...</option>';
        if (lista[marca]) lista[marca].forEach(mod => modeloSelect.innerHTML += `<option value="${mod}">${mod}</option>`);
    });

    // 🔹 3. UI Helper para mostrar/ocultar campos según tipo
    function setUIForType(type) {
        const isMoto = type === 'moto';
        document.getElementById('mod_tipo_vehiculo').value = isMoto ? 'Motocicleta' : 'Automóvil';
        
        // Botones visuales
        document.getElementById('btn_tipo_moto').classList.toggle('active', isMoto);
        document.getElementById('btn_tipo_auto').classList.toggle('active', !isMoto);

        // Grids de fotos
        document.getElementById('grid-fotos-moto').style.display = isMoto ? 'grid' : 'none';
        document.getElementById('grid-fotos-auto').style.display = isMoto ? 'none' : 'grid';
        
        // Cilindraje
        document.getElementById('box-cilindraje').style.display = isMoto ? 'block' : 'none';
        
        // Cargar marcas correctas
        cargarMarcas(type);
    }

    // 🔹 4. Buscador
    btnBuscar.addEventListener('click', async () => {
        const placa = document.getElementById('mod_placa_input').value.trim().toUpperCase();
        if (!placa) return mostrarMsg(msgBusqueda, 'Ingrese una placa.', 'error');
        
        mostrarMsg(msgBusqueda, '🔍 Buscando...', 'success');
        btnBuscar.disabled = true;
        form.style.display = 'none';

        try {
            // Buscar en Motos
            let { data: moto, error: errMoto } = await window.supabaseClient.from('registro_motos').select('*').eq('placa', placa).maybeSingle();
            
            if (moto && !errMoto) {
                cargarDatos(moto, 'registro_motos', 'moto');
            } else {
                // Buscar en Autos
                let { data: auto, error: errAuto } = await window.supabaseClient.from('registro_automoviles').select('*').eq('placa', placa).maybeSingle();
                
                if (auto && !errAuto) {
                    cargarDatos(auto, 'registro_automoviles', 'auto');
                } else {
                    mostrarMsg(msgBusqueda, '❌ Vehículo no encontrado.', 'error');
                }
            }
        } catch (e) {
            console.error(e);
            mostrarMsg(msgBusqueda, '❌ Error de conexión.', 'error');
        } finally {
            btnBuscar.disabled = false;
        }
    });

    // 🔹 5. Cargar Datos en el Formulario
    function cargarDatos(data, tabla, tipo) {
        currentData = data;
        currentTable = tabla;
        setUIForType(tipo);
        
        form.style.display = 'block';
        mostrarMsg(msgBusqueda, '✅ Registro cargado. Puede editar y guardar.', 'success');

        // Llenar campos comunes
        document.getElementById('mod_id_original').value = data.id;
        document.getElementById('m_placa').value = data.placa;
        document.getElementById('m_serial_carroceria').value = data.serial_carroceria || '';
        document.getElementById('m_serial_motor').value = data.serial_motor || '';
        document.getElementById('m_color').value = data.color;
        document.getElementById('m_direccion_detencion').value = data.direccion_detencion || '';
        document.getElementById('m_observaciones').value = data.observaciones || '';
        document.getElementById('m_estacion').value = data.estacion_policial || '';
        document.getElementById('m_anio').value = data.anio;
        document.getElementById('mod_estatus_badge').textContent = data.estatus || 'Verificación';

        // Llenar Marca y Modelo (Espera a que el evento change de marca cargue los modelos)
        if (data.marca) {
            marcaSelect.value = data.marca;
            marcaSelect.dispatchEvent(new Event('change')); // Disparar evento para llenar modelos
            setTimeout(() => { modeloSelect.value = data.modelo; }, 100);
        }

        // Campos específicos
        if (tipo === 'moto') {
            document.getElementById('m_cilindraje').value = data.cilindraje || '';
        }

        // Cargar Previsualización de Fotos Existentes
        mostrarPreview('m_prev_frontal', data.foto_frontal);
        mostrarPreview('m_prev_trasera', data.foto_trasera);
        mostrarPreview('m_prev_der', data.foto_lado_derecho);
        mostrarPreview('m_prev_izq', data.foto_lado_izquierdo);
    }

    function mostrarPreview(imgId, url) {
        const img = document.getElementById(imgId);
        if (url) { img.src = url; img.style.display = 'block'; }
        else { img.style.display = 'none'; }
    }

    // 🔹 6. Guardar Cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentData) return mostrarMsg(msgBox, 'Busque un vehículo primero.', 'error');
        
        // Validaciones básicas
        const serialCarro = document.getElementById('m_serial_carroceria').value.trim();
        const color = document.getElementById('m_color').value;
        if (!serialCarro) return mostrarMsg(msgBox, 'El serial de carrocería es obligatorio.', 'error');
        if (!color) return mostrarMsg(msgBox, 'Seleccione un color.', 'error');

        const btnSubmit = form.querySelector('.btn-submit');
        btnSubmit.disabled = true; btnSubmit.textContent = '⏳ Guardando...';
        mostrarMsg(msgBox, '', ''); // Limpiar

        try {
            const bucket = window.supabaseClient.storage.from('fotos_vehiculos');
            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();
            const tipo = document.getElementById('mod_tipo_vehiculo').value === 'Motocicleta' ? 'moto' : 'auto';
            const prefix = tipo === 'moto' ? 'm_' : 'm_'; // Los IDs en HTML usan m_ para ambos pero con sufijos

            // Función auxiliar para subir foto SOLO SI CAMBIA
            const uploadIfNeeded = async (inputId, currentUrl, suffix) => {
                const file = document.getElementById(inputId).files[0];
                if (!file) return currentUrl; // Si no hay archivo nuevo, retorna la URL actual
                
                // Si hay archivo nuevo, subir
                const path = `${uid}/mod_${ts}_${suffix}.jpg`;
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo foto.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            // Subir las 4 fotos si fueron cambiadas
            const f1 = await uploadIfNeeded(tipo === 'moto' ? 'm_foto_frontal' : 'm_foto_frontal_a', currentData.foto_frontal, 'f');
            const f2 = await uploadIfNeeded(tipo === 'moto' ? 'm_foto_trasera' : 'm_foto_trasera_a', currentData.foto_trasera, 't');
            const f3 = await uploadIfNeeded(tipo === 'moto' ? 'm_foto_der' : 'm_foto_der_a', currentData.foto_lado_derecho, 'rd');
            const f4 = await uploadIfNeeded(tipo === 'moto' ? 'm_foto_izq' : 'm_foto_izq_a', currentData.foto_lado_izquierdo, 'ri');

            // Preparar datos
            const updateData = {
                serial_carroceria: serialCarro,
                serial_motor: document.getElementById('m_serial_motor').value.trim() || null,
                color: color,
                marca: document.getElementById('m_marca').value,
                modelo: document.getElementById('m_modelo').value,
                anio: parseInt(document.getElementById('m_anio').value),
                direccion_detencion: document.getElementById('m_direccion_detencion').value.trim() || null,
                observaciones: document.getElementById('m_observaciones').value.trim() || null,
                estacion_policial: document.getElementById('m_estacion').value,
                foto_frontal: f1, foto_trasera: f2,
                foto_lado_derecho: f3, foto_lado_izquierdo: f4
            };

            if (tipo === 'moto') {
                updateData.cilindraje = document.getElementById('m_cilindraje').value;
            }

            // Actualizar en la tabla correspondiente
            const { error } = await window.supabaseClient.from(currentTable).update(updateData).eq('id', currentData.id);
            if (error) throw error;

            mostrarMsg(msgBox, '✅ Vehículo actualizado correctamente.', 'success');
            setTimeout(() => { form.style.display = 'none'; msgBox.style.display = 'none'; document.getElementById('mod_placa_input').value = ''; }, 4000);

        } catch (err) {
            console.error(err);
            mostrarMsg(msgBox, '❌ Error: ' + err.message, 'error');
        } finally {
            const btnSubmit = form.querySelector('.btn-submit');
            btnSubmit.disabled = false; btnSubmit.textContent = '💾 Guardar Cambios';
        }
    });

    // 🔹 Helpers UI
    function mostrarMsg(el, txt, type) {
        if (el) { el.textContent = txt; el.className = `msg ${type}`; el.style.display = txt ? 'block' : 'none'; }
    }

    // Inicializar con vista de moto por defecto (aunque se ocultará al buscar)
    setUIForType('moto');
};
