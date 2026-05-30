window.initRegVehiculos = function() {
    // 🔹 BASE DE DATOS DE MARCAS Y MODELOS
    const marcasModelos = {
        "Empire Keeway": ["Matrix Lite", "Matrix II 150", "EK Xpress Lite", "QJ Fort", "Horse (EK Horse 2 SE)", "EK Arsen II 200", "EK Atlas", "EK Atlas HD/HDS 200", "Owen 200", "Thunder EK", "TX II 150", "TX 250GS", "QJ Motor SRT 550", "QJ Motor SRT 550X", "QJ Motor SRT 700S", "QJ Motor SRT 700SX", "Superlight 200S", "V302C"],
        "Bera Motorcycles": ["Bera BWS", "Milán", "Runner", "SBR", "X1", "BRF", "León", "BR200 / DT", "Cobra", "Kavak", "BRZ", "GR", "Antiking", "Carguero"],
        "Motos Toro": ["Toro Jaguar TR150cc", "Toro León TR200cc", "Toro TRX 150", "Toro TRX 250", "Toro Cappuccino TR180cc", "Toro Power TR180cc", "Toro Moka 150", "Toro Fox TR180cc", "Toro REX TR150cc", "Toro REX TR250cc", "Toro REX Motard", "Toro R3X 250", "Toro Tank TR180cc", "Toro Cyclone RX650"],
        "MD Motos (MD Haojin)": ["MD Águila 150cc", "MD Canario 150cc", "MD Cóndor 150cc", "MD Cardenal 150cc", "MD Fénix 150cc", "MD Tauro 150cc", "MD Gavilán 150cc", "MD Falco 200cc", "MD Lechuza 200cc", "MD Cuervo 150cc", "MD Abeja / Colibrí 150cc", "MD Boa 200 (Carguero)"],
        "AVA Motors": ["AVA Jaguar 150cc", "AVA León 150cc", "AVA Chita 150cc", "AVA Pantera 150cc", "AVA Leopardo 150cc", "AVA Tucán 110cc", "AVA Avispón 150cc", "AVA Flash 150cc", "AVA Águila 150cc", "AVA Tigrito 175cc", "AVA Mustang 250cc", "AVA Deer 250cc", "AVA Tigre 250cc", "AVA Mule", "AVA Rhino 250cc (Tricargo)"],
        "Skygo": ["Skygo Executive 250 (SG250)", "Skygo Majestic 250", "Skygo Elegance 250", "Skygo Edge 250", "Skygo Crossac 250", "Skygo Enduro G2", "Skygo SG150 / Skigo 150cc", "Skygo Sg150t-8", "Skygo Chopper KV-AK150"],
        "Murasaki Motorcycle": ["Kawi 150", "Caracal 150", "Tributo 150", "Caravan 150", "Portimao 150", "Fenix 150", "Fenix 200", "Ray 2 150", "Super Ray 150", "Infernus 200", "Predator X 300", "XS3 (Scooter eléctrica)", "XS6 (Eléctrica)", "Karuay 110", "MetallicCat 200 (Motocargo)"],
        "Bel Motos": ["Bel Matrix 150", "Bel New Matrix 150", "Bel Speed 150", "Bel Evo 150", "Bel Max 150", "Bel Max 200", "Bel Owen 150", "Bel Horse 150", "Bel Gloster 150", "Bel RK6 200", "Bel Sierra 200", "Bel Dakar 200", "Bel Space 150", "Bel Cargo 200"],
        "Motos Kadi": ["Kadi KD150-13 (Kadi Hawk)", "Kadi KD150-15 (Kadi Jaguar)", "Kadi KD150-23 (Kadi León)", "Kadi KD150-2B (Kadi Águila)", "Kadi KD150T-5 (Kadi Scooter)", "Kadi KD200 (Kadi Enduro / Doble Propósito)", "Kadi KD200-ZH (Kadi Motocargo)"],
        "Escuda Motorcycles": ["Escuda Hero", "Escuda Adventure", "Escuda Extreme", "Escuda EM200", "Escuda New Jog", "Escuda Alexa"],
        "Yamaha": ["Yamaha YBR 125", "Yamaha FZ16 / FZ-S / FZ25", "Yamaha YZF-R1 / R6 / R3 / R15", "Yamaha MT-03 / MT-07 / MT-09 / MT-10", "Yamaha TMAX / XMAX / NMAX / BWS (Zuma)", "Yamaha Crypton 110", "Yamaha DT 125 / DT 175", "Yamaha XT 660R / XT 600", "Yamaha Ténéré 700 / Super Ténéré 1200", "Yamaha WR 250F / WR 450F", "Yamaha YZ 250F / YZ 450F", "Yamaha Bolt C-Spec", "Yamaha V-Star 250 / 650 / 1100", "Yamaha XTZ 125 / XTZ 150 / XTZ 250 Lander", "Yamaha Crux 110", "Yamaha RayZR 125", "Yamaha Fascino 125", "Yamaha Tracer 7 / Tracer 9 GT", "Yamaha XSR 155 / XSR 700 / XSR 900", "Yamaha Raptor 700R (Cuatrimoto / ATV)", "Yamaha YFZ450R (Cuatrimoto / ATV)", "Yamaha Grizzly 700 (Cuatrimoto / ATV)"],
        "Honda": ["Honda CG 150 Titan / Titan 120", "Honda CB 125F / CB 190R / CB 250 Twister / CB 500F / CB 650F / CB 1000R", "Honda CBR 250R / CBR 600RR / CBR 1000RR Fireblade", "Honda CRF 250F / CRF 250R / CRF 450R / CRF 1100L Africa Twin", "Honda XR 150L / XR 190L / XR 250 Tornado / XR 650L", "Honda XRE 190 / XRE 300", "Honda Transalp XL750", "Honda GL 1800 Gold Wing", "Honda CMX 500 Rebel / CMX 1100 Rebel", "Honda Shadow 750", "Honda NC 750X", "Honda X-ADV 750", "Honda ADV 160 / ADV 350", "Honda PCX 160", "Honda Elite 125", "Honda Dio 110", "Honda NAVI 110", "Honda Wave 110S", "Honda Biz 125", "Honda GL 150 Cargo", "Honda TRX 420 FourTrax / TRX 700XX (Cuatrimoto / ATV)"],
        "Suzuki": ["Suzuki GN 125", "Suzuki AX 100", "Suzuki DR 150 / DR 200 / DR 650", "Suzuki Gixxer 150 / Gixxer 250", "Suzuki GSX-R600 / GSX-R750 / GSX-R1000", "Suzuki GSX-S750 / GSX-S1000", "Suzuki Hayabusa (GSX1300R)", "Suzuki V-Strom 250 / V-Strom 650 / V-Strom 1050", "Suzuki Boulevard C50 / M109R", "Suzuki Burgman 125 / Burgman 200 / Burgman 400 / Burgman 650", "Suzuki Address 115", "Suzuki Avenis 125", "Suzuki Access 125", "Suzuki EN 125 HU", "Suzuki Katana", "Suzuki SV 650", "Suzuki RM-Z250 / RM-Z450", "Suzuki KingQuad 400 / KingQuad 750 (Cuatrimoto / ATV)"],
        "KTM": ["KTM 125 Duke / 200 Duke / 250 Duke / 390 Duke / 790 Duke / 890 Duke / 990 Duke / 1390 Super Duke R", "KTM RC 125 / RC 200 / RC 390 / RC 8C", "KTM 250 Adventure / 390 Adventure / 790 Adventure / 890 Adventure / 1290 Super Adventure / 1390 Super Adventure", "KTM 690 Enduro R", "KTM 690 SMC R", "KTM 150 EXC / 250 EXC / 300 EXC (TPI / hardenduro)", "KTM 250 EXC-F / 350 EXC-F / 450 EXC-F / 500 EXC-F", "KTM 125 SX / 250 SX", "KTM 250 SX-F / 350 SX-F / 450 SX-F", "KTM 50 SX / 65 SX / 85 SX", "KTM Freeride E-XC"],
        "Ducati": ["Ducati Monster", "Ducati Diavel / XDiavel", "Ducati Hypermotard", "Ducati Multistrada", "Ducati Panigale", "Ducati Streetfighter", "Ducati SuperSport", "Ducati DesertX", "Ducati Scrambler", "Ducati Superleggera"],
        "Benelli": ["Benelli TNT 15", "Benelli TNT 25", "Benelli TNT 135", "Benelli TNT 150i", "Benelli TNT 250", "Benelli TNT 300", "Benelli TNT 600i", "Benelli 180S", "Benelli 302S", "Benelli 502C", "Benelli 752S", "Benelli TRK 251 / TRK 502 / TRK 502X / TRK 702 / TRK 702X / TRK 800", "Benelli Leoncino 125 / Leoncino 250 / Leoncino 500 / Leoncino 800", "Benelli Imperiale 400", "Benelli BKX 250 / BKX 300", "Benelli VZ 125i", "Benelli Panarea 125"],
        "Kawasaki": ["Kawasaki Ninja 250R / 300 / 400 / 500 / 650 / 1000SX / H2 / H2R", "Kawasaki Ninja ZX-4R / ZX-6R / ZX-10R / ZX-14R", "Kawasaki Z125 Pro / Z400 / Z500 / Z650 / Z900 / Z1000 / Z H2", "Kawasaki Z650RS / Z900RS", "Kawasaki Versys-X 300 / Versys 650 / Versys 1000", "Kawasaki KLR 650", "Kawasaki KLX 110 / 140 / 150 / 230 / 300 / 450R", "Kawasaki KX 65 / 85 / 112 / 250 / 450", "Kawasaki Vulcan S / Vulcan 900 / Vulcan 1700 Voyager", "Kawasaki Eliminator / Eliminator 450", "Kawasaki Concours 14", "Kawasaki Brute Force 300 / Brute Force 750 (Cuatrimoto / ATV)"],
        "Otra": ["Otra (Especificar en observaciones)"]
    };

    // 🔹 1. Poblar Select de Marcas y Modelos
    const marcaSelect = document.getElementById('v_marca');
    const modeloSelect = document.getElementById('v_modelo');
    const anioSelect = document.getElementById('v_anio');

    if (marcaSelect && modeloSelect) {
        Object.keys(marcasModelos).sort().forEach(marca => {
            marcaSelect.innerHTML += `<option value="${marca}">${marca}</option>`;
        });
        marcaSelect.addEventListener('change', function() {
            const marcaSeleccionada = this.value;
            modeloSelect.innerHTML = '<option value="">Seleccione modelo...</option>';
            if (marcasModelos[marcaSeleccionada]) {
                marcasModelos[marcaSeleccionada].forEach(mod => modeloSelect.innerHTML += `<option value="${mod}">${mod}</option>`);
            }
        });
    }

    if (anioSelect) {
        const currentYear = new Date().getFullYear();
        anioSelect.innerHTML = '<option value="">Seleccione año...</option>';
        for (let y = currentYear; y >= 1850; y--) anioSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }

    // 🔹 2. Selector de Tipo (Moto/Auto) ✅ CORREGIDO
    window.selectVehicleType = function(type) {
        document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
        document.getElementById('v_tipo').value = (type === 'moto') ? 'Motocicleta' : 'Automóvil';
        
        const isMoto = type === 'moto';
        const motoGrid = document.getElementById('grid-fotos-moto');
        const autoGrid = document.getElementById('grid-fotos-auto');
        const cilindrajeBox = document.getElementById('box-cilindraje');
        
        // Mostrar/Ocultar contenedores
        motoGrid.style.display = isMoto ? 'grid' : 'none';
        autoGrid.style.display = isMoto ? 'none' : 'grid';
        cilindrajeBox.style.display = isMoto ? 'block' : 'none';
        
        // ✅ SOLUCIÓN DEFINITIVA: Agregar/quitar 'required' según visibilidad
        // Esto evita que el navegador intente validar campos ocultos
        motoGrid.querySelectorAll('input[type="file"]').forEach(i => i.required = isMoto);
        autoGrid.querySelectorAll('input[type="file"]').forEach(i => i.required = !isMoto);
        cilindrajeBox.querySelector('select').required = isMoto;
        
        // Limpiar inputs al cambiar tipo
        document.querySelectorAll('input[type="file"]').forEach(i => i.value = '');
        document.querySelectorAll('.img-preview').forEach(i => i.style.display = 'none');
    };

    // ✅ Inicializar estado correcto al cargar para evitar errores de focus
    setTimeout(() => selectVehicleType('moto'), 0);

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
    setupPreview('v_foto_frontal', 'prev_v_frontal'); setupPreview('v_foto_trasera', 'prev_v_trasera');
    setupPreview('v_foto_der', 'prev_v_der'); setupPreview('v_foto_izq', 'prev_v_izq');
    setupPreview('v_foto_frontal_a', 'prev_v_frontal_a'); setupPreview('v_foto_trasera_a', 'prev_v_trasera_a');
    setupPreview('v_foto_der_a', 'prev_v_der_a'); setupPreview('v_foto_izq_a', 'prev_v_izq_a');

    // 🔹 4. Envío del Formulario
    const form = document.getElementById('form-reg-vehiculos');
    const btn = form?.querySelector('.btn-submit');
    const msg = document.getElementById('msg-reg-vehiculos');
    const mostrarError = (t) => { if(msg){msg.textContent='❌ '+t; msg.className='msg error'; msg.style.display='block';} };

    if (!form || !btn) return console.error('❌ Formulario no encontrado');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validación HTML5 solo de campos VISIBLES
        if (!form.checkValidity()) { 
            form.reportValidity(); 
            return; 
        }

        const placa = document.getElementById('v_placa').value.trim().toUpperCase();
        const anio = parseInt(document.getElementById('v_anio').value);
        const serialCarro = document.getElementById('v_serial_carroceria').value.trim();
        const color = document.getElementById('v_color').value.trim();
        const estacion = document.getElementById('v_estacion')?.value;
        const dirDetencion = document.getElementById('v_direccion_detencion')?.value.trim() || null;
        const marca = document.getElementById('v_marca').value;
        const modelo = document.getElementById('v_modelo').value;

        if (placa.length < 5) return mostrarError('Verifique la placa.');
        if (isNaN(anio) || anio < 1850) return mostrarError('Seleccione un año válido.');
        if (!serialCarro) return mostrarError('El serial de carrocería es obligatorio.');
        if (!color) return mostrarError('El color es obligatorio.');
        if (!estacion) return mostrarError('Seleccione la estación policial.');
        if (!marca || marca === 'Seleccione marca...') return mostrarError('Seleccione una marca.');
        if (!modelo || modelo === 'Seleccione modelo...') return mostrarError('Seleccione un modelo.');

        btn.disabled = true; btn.textContent = '⏳ Guardando...'; if(msg) msg.style.display='none';

        try {
            const isMoto = document.getElementById('v_tipo').value === 'Motocicleta';
            const tablaDestino = isMoto ? 'registro_motos' : 'registro_automoviles';
            const bucket = window.supabaseClient.storage.from('fotos_vehiculos');
            const uid = sessionStorage.getItem('pnb_user_id') || 'user';
            const ts = Date.now();

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
            const prefix = isMoto ? '' : '_a';
            [urls.f, urls.r, urls.rd, urls.ri] = await Promise.all([
                uploadFile(`v_foto_frontal${prefix}`, 'f'), uploadFile(`v_foto_trasera${prefix}`, 't'),
                uploadFile(`v_foto_der${prefix}`, 'rd'), uploadFile(`v_foto_izq${prefix}`, 'ri')
            ]);

            const data = {
                estatus: 'Verificación',
                estacion_policial: estacion,
                direccion_detencion: dirDetencion,
                placa, anio, color, serial_carroceria: serialCarro,
                marca, modelo,
                observaciones: document.getElementById('v_observaciones')?.value.trim() || null,
                foto_frontal: urls.f, foto_trasera: urls.r,
                foto_lado_derecho: urls.rd, foto_lado_izquierdo: urls.ri
            };

            if (isMoto) {
                data.serial_motor = document.getElementById('v_serial_motor').value.trim() || null;
                data.cilindraje = document.getElementById('v_cilindraje').value;
            } else {
                data.serial_motor = document.getElementById('v_serial_motor').value.trim() || null;
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
