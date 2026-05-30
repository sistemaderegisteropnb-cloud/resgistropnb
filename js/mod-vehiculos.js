window.initModVehiculos = function() {
    // 🔹 LISTAS COMPLETAS DE MARCAS/MODELOS (IDÉNTICAS A REGISTRO)
    const marcasModelosMoto = {
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
        "Yamaha": ["Yamaha YBR 125", "Yamaha FZ16", "Yamaha FZ-S", "Yamaha MT-03", "Yamaha XTZ 125", "Yamaha XTZ 150", "Yamaha XTZ 250 Lander", "Yamaha FZ25", "Yamaha FZ-S v2", "Yamaha SZ-RR", "Yamaha R15", "Yamaha R3", "Yamaha MT-15", "Yamaha Tenere 250", "Yamaha YS 250 Fazer", "Yamaha Lander 250", "Yamaha XTZ 125", "Yamaha YB125", "Yamaha YBR 150", "Yamaha YBR 125 Custom", "Yamaha Crypton 110", "Yamaha Jog", "Yamaha Xeon RC", "Yamaha Neo 125", "Yamaha Zuma", "Yamaha TMAX", "Yamaha XMAX", "Yamaha NMAX", "Yamaha Tricity", "Yamaha FJR1300", "Yamaha FZ8", "Yamaha FZ6", "Yamaha YZF-R1", "Yamaha YZF-R6", "Yamaha MT-07", "Yamaha MT-09", "Yamaha MT-10", "Yamaha Tracer 700", "Yamaha Tracer 900", "Yamaha Ténéré 700", "Yamaha WR 250F", "Yamaha WR 450F", "Yamaha YZ 125", "Yamaha YZ 250", "Yamaha YZ 250F", "Yamaha YZ 450F", "Yamaha PW 50", "Yamaha TT-R 110", "Yamaha TT-R 125", "Yamaha TT-R 230", "Yamaha XT 225", "Yamaha TW 200", "Yamaha Serow 250", "Yamaha Bolt", "Yamaha Star Venture", "Yamaha Super Ténéré", "Yamaha FJR1300ES", "Yamaha YZF-R1M", "Yamaha YZF-R6 Race", "Yamaha MT-09 SP", "Yamaha MT-10 SP", "Yamaha Tracer 9 GT", "Yamaha Niken", "Yamaha Lev 125", "Yamaha Aerox 155", "Yamaha Ray ZR", "Yamaha Fascino", "Yamaha Ray 110", "Yamaha Crux", "Yamaha Saluto", "Yamaha Libero", "Yamaha RX 135", "Yamaha RX 100", "Yamaha RD 350", "Yamaha YSR 50", "Yamaha TZR 50", "Yamaha DT 50", "Yamaha TDR 50", "Yamaha YZ 85", "Yamaha YZ 65", "Yamaha PW 80", "Yamaha TT-R 50", "Yamaha TTR 50", "Yamaha TTR 110", "Yamaha TTR 125L", "Yamaha TTR 230", "Yamaha XT 225 Dual Sport", "Yamaha TW 200 Fat Tire", "Yamaha Serow 250 Enduro", "Yamaha WR 250R", "Yamaha WR 250X", "Yamaha YZ 125 LC", "Yamaha YZ 250 2T", "Yamaha YZ 450F", "Yamaha YZ 250F", "Yamaha YZ 125", "Yamaha YZ 85", "Yamaha YZ 65", "Yamaha PW 50", "Yamaha TT-R 110", "Yamaha TT-R 125", "Yamaha TT-R 230", "Yamaha XT 225", "Yamaha TW 200", "Yamaha Serow 250", "Yamaha Bolt", "Yamaha Star Venture", "Yamaha Super Ténéré", "Yamaha FJR1300ES", "Yamaha YZF-R1M", "Yamaha YZF-R6 Race", "Yamaha MT-09 SP", "Yamaha MT-10 SP", "Yamaha Tracer 9 GT", "Yamaha Niken", "Yamaha Lev 125", "Yamaha Aerox 155", "Yamaha Ray ZR", "Yamaha Fascino", "Yamaha Ray 110", "Yamaha Crux", "Yamaha Saluto", "Yamaha Libero", "Yamaha RX 135", "Yamaha RX 100", "Yamaha RD 350", "Yamaha YSR 50", "Yamaha TZR 50", "Yamaha DT 50", "Yamaha TDR 50"],
        "Honda": ["Honda CG 150 Titan / Titan 120", "Honda CB 125F / CB 190R / CB 250 Twister / CB 500F / CB 650F / CB 1000R", "Honda CBR 250R / CBR 600RR / CBR 1000RR Fireblade", "Honda CRF 250F / CRF 250R / CRF 450R / CRF 1100L Africa Twin", "Honda XR 150L / XR 190L / XR 250 Tornado / XR 650L", "Honda XRE 190 / XRE 300", "Honda Transalp XL750", "Honda GL 1800 Gold Wing", "Honda CMX 500 Rebel / CMX 1100 Rebel", "Honda Shadow 750", "Honda NC 750X", "Honda X-ADV 750", "Honda ADV 160 / ADV 350", "Honda PCX 160", "Honda Elite 125", "Honda Dio 110", "Honda NAVI 110", "Honda Wave 110S", "Honda Biz 125", "Honda GL 150 Cargo", "Honda TRX 420 FourTrax / TRX 700XX (Cuatrimoto / ATV)"],
        "Suzuki": ["Suzuki GN 125", "Suzuki AX 100", "Suzuki DR 150 / DR 200 / DR 650", "Suzuki Gixxer 150 / Gixxer 250", "Suzuki GSX-R600 / GSX-R750 / GSX-R1000", "Suzuki GSX-S750 / GSX-S1000", "Suzuki Hayabusa (GSX1300R)", "Suzuki V-Strom 250 / V-Strom 650 / V-Strom 1050", "Suzuki Boulevard C50 / M109R", "Suzuki Burgman 125 / Burgman 200 / Burgman 400 / Burgman 650", "Suzuki Address 115", "Suzuki Avenis 125", "Suzuki Access 125", "Suzuki EN 125 HU", "Suzuki Katana", "Suzuki SV 650", "Suzuki RM-Z250 / RM-Z450", "Suzuki KingQuad 400 / KingQuad 750 (Cuatrimoto / ATV)"],
        "KTM": ["KTM 125 Duke / 200 Duke / 250 Duke / 390 Duke / 790 Duke / 890 Duke / 990 Duke / 1390 Super Duke R", "KTM RC 125 / RC 200 / RC 390 / RC 8C", "KTM 250 Adventure / 390 Adventure / 790 Adventure / 890 Adventure / 1290 Super Adventure / 1390 Super Adventure", "KTM 690 Enduro R", "KTM 690 SMC R", "KTM 150 EXC / 250 EXC / 300 EXC (TPI / hardenduro)", "KTM 250 EXC-F / 350 EXC-F / 450 EXC-F / 500 EXC-F", "KTM 125 SX / 250 SX", "KTM 250 SX-F / 350 SX-F / 450 SX-F", "KTM 50 SX / 65 SX / 85 SX", "KTM Freeride E-XC"],
        "Ducati": ["Ducati Monster", "Ducati Diavel / XDiavel", "Ducati Hypermotard", "Ducati Multistrada", "Ducati Panigale", "Ducati Streetfighter", "Ducati SuperSport", "Ducati DesertX", "Ducati Scrambler", "Ducati Superleggera"],
        "Benelli": ["Benelli TNT 15", "Benelli TNT 25", "Benelli TNT 135", "Benelli TNT 150i", "Benelli TNT 250", "Benelli TNT 300", "Benelli TNT 600i", "Benelli 180S", "Benelli 302S", "Benelli 502C", "Benelli 752S", "Benelli TRK 251 / TRK 502 / TRK 502X / TRK 702 / TRK 702X / TRK 800", "Benelli Leoncino 125 / Leoncino 250 / Leoncino 500 / Leoncino 800", "Benelli Imperiale 400", "Benelli BKX 250 / BKX 300", "Benelli VZ 125i", "Benelli Panarea 125"],
        "Kawasaki": ["Kawasaki Ninja 250R / 300 / 400 / 500 / 650 / 1000SX / H2 / H2R", "Kawasaki Ninja ZX-4R / ZX-6R / ZX-10R / ZX-14R", "Kawasaki Z125 Pro / Z400 / Z500 / Z650 / Z900 / Z1000 / Z H2", "Kawasaki Z650RS / Z900RS", "Kawasaki Versys-X 300 / Versys 650 / Versys 1000", "Kawasaki KLR 650", "Kawasaki KLX 110 / 140 / 150 / 230 / 300 / 450R", "Kawasaki KX 65 / 85 / 112 / 250 / 450", "Kawasaki Vulcan S / Vulcan 900 / Vulcan 1700 Voyager", "Kawasaki Eliminator / Eliminator 450", "Kawasaki Concours 14", "Kawasaki Brute Force 300 / Brute Force 750 (Cuatrimoto / ATV)"],
        "Otra": ["Otra (Especificar en observaciones)"]
    };

    const marcasModelosAuto = {
        "Toyota": ["Corolla", "Yaris", "Hilux", "Fortuner", "Camry", "Land Cruiser", "Prado", "Rav4", "Etios", "Agya", "HiAce", "Yaris Cross", "4Runner", "Sequoia", "Tundra", "Tacoma", "Coaster", "Terios", "Starlet", "Celica", "Merú", "Aygo X", "Aqua", "Avanza", "Rush", "Raize", "Yaris Heykers", "GR Yaris", "GR Corolla", "GR86", "GR Supra", "Avalon", "Century", "Crown", "Mirai", "bZ4X", "Urban Cruiser", "C-HR", "Harrier", "Highlander", "Venza", "Sienna", "Alphard", "Innova", "Roomy", "Sienta", "Voxy", "Noah", "Probox", "LiteAce", "Hilux Champ", "Proace"],
        "Chevrolet": ["Spark", "Aveo", "Optra", "Cruze", "Onix", "Cavalier", "Tracker", "Captiva", "Trailblazer", "Traverse", "Tahoe", "Suburban", "Orlando", "Silverado", "Colorado", "D-Max", "Grand Vitara", "LUV", "Astra", "Corsa", "Meriva", "Zafira", "Epica", "Impala", "Malibu", "Century", "Celebrity", "Caprice", "Swift", "San Remo", "Trax", "Chevette", "Lumina", "Monte carlos", "Equinox", "Blazer", "Silverado EV", "Montana", "S10", "Spin", "Groove", "Seeker", "Monza", "Sail", "Menlo", "Bolt EV"],
        "Ford": ["Territory", "EcoSport", "Escape", "Edge", "Explorer", "Everest", "Bronco", "Expedition", "Ranger", "F-150", "F-350", "Fiesta", "Focus", "Laser", "Festiva", "Ka", "Fusion", "Mustang", "Sierra"],
        "Jeep": ["CJ-5", "Wrangler", "Cherokee", "Grand Cherokee", "Gladiator", "Compass", "Renegade", "Commander", "Wagoneer", "J-10", "Comanche", "Avenger", "Recon", "Wagoneer S", "Grand Commander", "Meridian"],
        "RAM": ["Ram 1500", "Ram 2500", "Ram 3500", "Ram 700", "Ram 1000", "Ram 1200", "Ram Rampage", "Ram 1500 RHO", "Ram 1500 TRX", "Ram 1500 REV", "Ram ProMaster", "Ram ProMaster City"],
        "Hyundai": ["Grand i10", "Accent", "Elantra", "Sonata", "Getz", "Matrix", "Atos", "Excel", "Scoupe", "Creta", "Tucson", "Santa Fe", "Veracruz", "Terracan", "Galloper", "Palisade", "Kona", "Ioniq", "Staria", "H-1 / Starex", "HD65", "i10", "HB20", "Bayon", "Venue", "Alcazar", "Mufasa", "Casper", "Inster", "Lafesta", "Celesta", "Aura", "Grandeur", "Santa Cruz", "Nexo", "Porter / H-100"],
        "Kia": ["Picanto", "Soluto", "Sonet", "Seltos", "Sportage", "Sorento", "Carnival", "Rio", "Cerato", "Optima", "Carens", "Pregio", "Besta", "K2700", "Sephia", "Spectra", "Opirus", "Tasman", "EV2", "EV3", "EV6", "EV9", "K3", "K5", "K8", "K9", "Ray", "Morning", "Ceed", "Stonic", "Niro", "Soul", "Telluride", "Stinger", "Cadenza", "Mohave", "Pegas", "Venga", "Joice"],
        "Fiat": ["Cronos", "Argo", "Pulse", "Fastback", "Mobi", "Toro", "Fiorino", "Uno", "Palio", "Siena", "Premio", "Regatta", "Tucán", "Ritmo", "Tempra", "Marea", "Brava", "Idea", "Stilo", "Strada", "500", "500X", "600", "Panda", "Tipo", "Titano", "Scudo", "Ducato", "Doblò", "Topolino"],
        "Renault": ["Logan", "Sandero", "Duster", "Oroch", "Koleos", "Kwid", "Twingo", "Clio", "Symbol", "Megane", "Scenic", "Laguna", "Kangoo", "R19", "Kardian", "Boreal", "Arkana", "Austral", "Rafale", "Espace", "Symbioz", "Captur", "Triber", "Kiger", "Master", "Trafic", "Express"],
        "JAC Motors": ["Arena", "Aventura (JS3)", "Nevado (JS4)", "Tepuy (JS6)", "Savanna (JS8)", "La Venezolana (T6)", "La Venezolana Pro (T8)", "T9", "J7", "Refine", "Sunray", "Bachaco", "Búfalo", "Leyenda"],
        "Changan Auto": ["Alsvin", "CS15", "CS35 Plus", "CS55 Plus", "CS75 Plus", "CS85 Coupe", "CS95", "Uni-T", "Uni-K", "Uni-V", "Hunter", "Star 5", "Q20"],
        "Foton": ["Tunland E", "Tunland G7", "TruckMate M25", "View C2", "Aumark S", "Auman R", "Mars V7", "Sauvana", "Toplander", "Toano", "View Transvan"],
        "Chery": ["Arrizo 5", "Tiggo 2 Pro", "Tiggo 4", "Tiggo 7 Pro", "Tiggo 8 Pro", "Tiggo 9", "QQ", "Omoda 5", "Jaecoo 7"],
        "Nissan": ["Versa", "Sentra", "Altima", "Pathfinder", "X-Trail", "Frontier", "Kicks", "March", "NP300", "Note", "Magnite"],
        "Volkswagen": ["Gol", "Polo", "Virtus", "Jetta", "Passat", "Tiguan", "T-Roc", "Taos", "Amarok", "Nivus"],
        "Peugeot": ["208", "301", "308", "408", "2008", "3008", "5008", "Partner", "Landtrek", "Rifter"],
        "Mitsubishi": ["L200", "Outlander", "ASX", "Montero", "Lancer", "Eclipse Cross", "Xpander", "Mirage"],
        "Mazda": ["Mazda 2", "Mazda 3", "Mazda 6", "CX-3", "CX-5", "CX-30", "CX-9", "MX-5", "BT-50"],
        "Geely": ["Coolray", "Azkarra", "Tugella", "Geometry C", "Okavango", "Emgrand"],
        "Otra": ["Otra (Especificar en observaciones)"]
    };

    // 🔹 Referencias DOM
    const marcaSelect = document.getElementById('m_marca');
    const modeloSelect = document.getElementById('m_modelo');
    const anioSelect = document.getElementById('m_anio');
    const form = document.getElementById('form-mod-vehiculos');
    const btnBuscar = document.getElementById('btn_buscar_mod');
    const inputBusqueda = document.getElementById('mod_busqueda_input');
    const msgBox = document.getElementById('msg_mod_vehiculos');
    const msgBusqueda = document.getElementById('mod_msg_busqueda');

    let currentData = null; // Datos actuales del registro encontrado
    let currentTable = '';

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
        document.getElementById('mod_tabla_destino').value = isMoto ? 'registro_motos' : 'registro_automoviles';
        
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

    // 🔹 4. 🔒 BUSCADOR EXACTO Y OBLIGATORIO
    btnBuscar.addEventListener('click', async () => {
        // 1. Normalizar entrada (Mayúsculas y sin espacios)
        const val = inputBusqueda.value.trim().toUpperCase();
        
        // 2. Validación estricta
        if (!val || val.length < 5) {
            return mostrarMsg(msgBusqueda, '⚠️ Ingrese un dato exacto y completo. Mínimo 5 caracteres.', 'error');
        }

        mostrarMsg(msgBusqueda, '🔍 Buscando coincidencia exacta...', 'success');
        btnBuscar.disabled = true;
        form.style.display = 'none';

        try {
            // 🔒 Query EXACTA usando .eq. en los 3 campos (No permite parciales)
            const query = `placa.eq.${val},serial_carroceria.eq.${val},serial_motor.eq.${val}`;
            
            // Intentar en Motos
            let { data: moto, error: errMoto } = await window.supabaseClient.from('registro_motos').select('*').or(query).maybeSingle();
            
            if (moto && !errMoto) {
                cargarDatos(moto, 'registro_motos', 'moto');
            } else {
                // Intentar en Autos
                let { data: auto, error: errAuto } = await window.supabaseClient.from('registro_automoviles').select('*').or(query).maybeSingle();
                
                if (auto && !errAuto) {
                    cargarDatos(auto, 'registro_automoviles', 'auto');
                } else {
                    mostrarMsg(msgBusqueda, '❌ No se encontró ningún vehículo con ese dato exacto.', 'error');
                }
            }
        } catch (e) {
            console.error(e);
            mostrarMsg(msgBusqueda, '❌ Error de conexión al buscar.', 'error');
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
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Llenar campos comunes
        document.getElementById('mod_id_original').value = data.id;
        document.getElementById('m_placa').value = data.placa;
        document.getElementById('m_serial_carroceria').value = data.serial_carroceria || '';
        document.getElementById('m_serial_motor').value = data.serial_motor || '';
        document.getElementById('m_direccion_detencion').value = data.direccion_detencion || '';
        document.getElementById('m_observaciones').value = data.observaciones || '';
        document.getElementById('m_estacion').value = data.estacion_policial || '';
        document.getElementById('m_anio').value = data.anio;
        document.getElementById('mod_estatus_badge').textContent = data.estatus || 'Verificación';

        // ✅ Llenar Color (Manejo seguro)
        const colorSelect = document.getElementById('m_color');
        if (data.color) {
            const optionExists = Array.from(colorSelect.options).some(opt => opt.value === data.color);
            if (optionExists) {
                colorSelect.value = data.color;
            } else {
                colorSelect.value = 'Otro'; 
            }
        } else {
            colorSelect.value = '';
        }

        // Llenar Marca y Modelo
        if (data.marca) {
            marcaSelect.value = data.marca;
            marcaSelect.dispatchEvent(new Event('change')); // Disparar evento para llenar modelos
            setTimeout(() => { modeloSelect.value = data.modelo; }, 150);
        }

        if (tipo === 'moto') {
            document.getElementById('m_cilindraje').value = data.cilindraje || '';
        }

        // ✅ Cargar Previsualización de Fotos Existentes (Corregido para detectar sufijos)
        const sufijo = tipo === 'moto' ? '' : '_a';
        
        mostrarPreview(`m_prev_frontal${sufijo}`, data.foto_frontal);
        mostrarPreview(`m_prev_trasera${sufijo}`, data.foto_trasera);
        mostrarPreview(`m_prev_der${sufijo}`, data.foto_lado_derecho);
        mostrarPreview(`m_prev_izq${sufijo}`, data.foto_lado_izquierdo);
    }

    // Función auxiliar para mostrar imagen si existe URL
    function mostrarPreview(imgId, url) {
        const img = document.getElementById(imgId);
        if (img) {
            if (url) { 
                img.src = url; 
                img.style.display = 'block'; 
            } else { 
                img.style.display = 'none'; 
            }
        }
    }

    // 🔹 6. Guardar Cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentData) return mostrarMsg(msgBox, 'Busque un vehículo primero.', 'error');
        
        // Validaciones
        const placa = document.getElementById('m_placa').value.trim().toUpperCase();
        const serialCarro = document.getElementById('m_serial_carroceria').value.trim();
        const color = document.getElementById('m_color').value;
        
        if (!placa) return mostrarMsg(msgBox, 'La placa es obligatoria.', 'error');
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

            // Función auxiliar para subir foto SOLO SI CAMBIA
            const uploadIfNeeded = async (inputId, currentUrl, suffix) => {
                const file = document.getElementById(inputId).files[0];
                if (!file) return currentUrl; // Si no hay archivo nuevo, retorna la URL actual
                
                const path = `${uid}/mod_${ts}_${suffix}.jpg`;
                const { error } = await bucket.upload(path, file, { cacheControl: '3600' });
                if (error) throw new Error('Error subiendo foto.');
                return bucket.getPublicUrl(path).data.publicUrl;
            };

            // Subir las 4 fotos si fueron cambiadas
            const sufijoInput = tipo === 'moto' ? '' : '_a';
            const f1 = await uploadIfNeeded(`m_foto_frontal${sufijoInput}`, currentData.foto_frontal, 'f');
            const f2 = await uploadIfNeeded(`m_foto_trasera${sufijoInput}`, currentData.foto_trasera, 't');
            const f3 = await uploadIfNeeded(`m_foto_der${sufijoInput}`, currentData.foto_lado_derecho, 'rd');
            const f4 = await uploadIfNeeded(`m_foto_izq${sufijoInput}`, currentData.foto_lado_izquierdo, 'ri');

            // Preparar datos con PLACA EDITABLE
            const updateData = {
                placa: placa, 
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
            const tablaFinal = document.getElementById('mod_tabla_destino').value;
            const { error: finalError } = await window.supabaseClient.from(tablaFinal).update(updateData).eq('id', currentData.id);
            if (finalError) throw finalError;

            mostrarMsg(msgBox, '✅ Vehículo actualizado correctamente.', 'success');
            setTimeout(() => { form.style.display = 'none'; msgBox.style.display = 'none'; inputBusqueda.value = ''; }, 4000);

        } catch (err) {
            console.error(err);
            let msg = 'Error: ' + err.message;
            if (err.message.includes('23505') || err.message.includes('unique')) {
                msg = '❌ Error: La placa ingresada ya existe en otro registro.';
            }
            mostrarMsg(msgBox, msg, 'error');
        } finally {
            const btnSubmit = form.querySelector('.btn-submit');
            btnSubmit.disabled = false; btnSubmit.textContent = '💾 Guardar Cambios';
        }
    });

    // 🔹 Helpers UI
    function mostrarMsg(el, txt, type) {
        if (el) { el.textContent = txt; el.className = `msg ${type}`; el.style.display = txt ? 'block' : 'none'; }
    }

    // Inicializar con vista de moto por defecto
    setUIForType('moto');
};
