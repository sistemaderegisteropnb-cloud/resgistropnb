window.initElimVehiculos = function() {
    const buscarInput = document.getElementById('buscar-input-elim');
    const buscarBtn = document.getElementById('btn-buscar-elim');
    const msgBuscar = document.getElementById('buscar-msg-elim');
    const dataContainer = document.getElementById('elim-data-container');
    const btnEliminar = document.getElementById('btn-eliminar');
    const msgElim = document.getElementById('msg-elim');
    const modal = document.getElementById('elim-modal');
    const modalText = document.getElementById('modal-text');
    const btnSi = document.getElementById('btn-confirm-si');
    const btnNo = document.getElementById('btn-confirm-no');

    let currentData = null;
    let currentId = null;
    let currentTable = ''; // 'registro_motos' o 'registro_automoviles'

    const showMsg = (el, txt, type) => { el.textContent = txt; el.className = `search-msg ${type}`; el.style.display = 'block'; };
    const hideMsg = (el) => { el.style.display = 'none'; };
    const showMsgElim = (txt, type) => { msgElim.textContent = txt; msgElim.className = `msg ${type}`; msgElim.style.display = 'block'; };
    const hideMsgElim = () => { msgElim.style.display = 'none'; };
    
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = (val !== null && val !== undefined && val !== '') ? val : '-'; };
    const setPhoto = (imgId, url) => { const img = document.getElementById(imgId); if (img) { img.src = url || ''; img.style.display = url ? 'block' : 'none'; } };

    async function buscarVehiculo() {
        const val = buscarInput.value.trim().toUpperCase();
        if (val.length < 5) return showMsg(msgBuscar, '⚠️ Ingrese un dato válido (mín. 5 caracteres).', 'error');
        
        showMsg(msgBuscar, '🔍 Buscando...', 'success');
        buscarBtn.disabled = true; dataContainer.style.display = 'none'; hideMsgElim();

        try {
            // 🔍 Búsqueda exacta en Motos
            const query = `placa.eq.${val},serial_carroceria.eq.${val},serial_motor.eq.${val}`;
            let { data: moto } = await window.supabaseClient.from('registro_motos').select('*').or(query).maybeSingle();
            if (moto) { mostrarDatos(moto, 'registro_motos', 'Motocicleta'); return; }

            // 🔍 Búsqueda exacta en Automóviles
            let { data: auto } = await window.supabaseClient.from('registro_automoviles').select('*').or(query).maybeSingle();
            if (auto) { mostrarDatos(auto, 'registro_automoviles', 'Automóvil'); return; }

            showMsg(msgBuscar, '❌ Vehículo no encontrado.', 'error');
        } catch (err) {
            console.error(err);
            showMsg(msgBuscar, '❌ Error de conexión.', 'error');
        } finally { buscarBtn.disabled = false; }
    }

    function mostrarDatos(data, tabla, tipo) {
        currentData = data;
        currentId = data.id;
        currentTable = tabla;
        hideMsg(msgBuscar);

        // Fotos
        setPhoto('elim-foto-frontal', data.foto_frontal);
        setPhoto('elim-foto-trasera', data.foto_trasera);
        setPhoto('elim-foto-der', data.foto_lado_derecho);
        setPhoto('elim-foto-izq', data.foto_lado_izquierdo);

        // Campos
        setVal('elim-placa', data.placa); setVal('elim-serial-carro', data.serial_carroceria);
        setVal('elim-serial-motor', data.serial_motor); setVal('elim-color', data.color);
        setVal('elim-marca', data.marca); setVal('elim-modelo', data.modelo);
        setVal('elim-anio', data.anio); setVal('elim-tipo', tipo);
        setVal('elim-estacion', data.estacion_policial); setVal('elim-dir-det', data.direccion_detencion);
        setVal('elim-estatus', data.estatus || 'Verificación'); setVal('elim-obs', data.observaciones);
        
        // Cilindraje solo para motos
        document.getElementById('box-cilindro').style.display = (tipo === 'Motocicleta' && data.cilindraje) ? 'block' : 'none';
        if (data.cilindraje) setVal('elim-cilindraje', data.cilindraje);

        dataContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 🔹 Listeners
    buscarBtn.addEventListener('click', buscarVehiculo);
    buscarInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarVehiculo(); } });
    
    btnEliminar.addEventListener('click', () => {
        modalText.textContent = `¿Está seguro que desea eliminar la placa ${currentData.placa}? El registro se archivará permanentemente.`;
        modal.style.display = 'flex';
    });
    btnNo.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // 🔹 Lógica de eliminación
    btnSi.addEventListener('click', async () => {
        modal.style.display = 'none';
        btnEliminar.disabled = true; btnEliminar.textContent = '⏳ Archivando y eliminando...';
        hideMsgElim();

        try {
            const userId = sessionStorage.getItem('pnb_user_id') || 'user';
            
            // Mapear datos exactos para la tabla de eliminados
            const registroElim = {
                id_original: currentId,
                tabla_origen: currentTable,
                tipo_vehiculo: document.getElementById('elim-tipo').value,
                placa: currentData.placa,
                marca: currentData.marca, modelo: currentData.modelo, anio: currentData.anio, color: currentData.color,
                serial_carroceria: currentData.serial_carroceria, serial_motor: currentData.serial_motor,
                cilindraje: currentData.cilindraje || null,
                direccion_detencion: currentData.direccion_detencion || null,
                estacion_policial: currentData.estacion_policial,
                estatus: currentData.estatus, observaciones: currentData.observaciones || null,
                foto_frontal: currentData.foto_frontal, foto_trasera: currentData.foto_trasera,
                foto_lado_derecho: currentData.foto_lado_derecho, foto_lado_izquierdo: currentData.foto_lado_izquierdo,
                eliminado_por: userId
            };

            // 1. Insertar en vehiculos_eliminados
            const { error: insError } = await window.supabaseClient.from('vehiculos_eliminados').insert([registroElim]);
            if (insError) throw insError;

            // 2. Eliminar de tabla original
            const { error: delError } = await window.supabaseClient.from(currentTable).delete().eq('id', currentId);
            if (delError) throw delError;

            showMsgElim('✅ Vehículo eliminado y archivado correctamente.', 'success');
            setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); }, 4000);
        } catch (err) {
            console.error('Error eliminando:', err);
            let msg = 'Error al eliminar. Intente nuevamente.';
            if (err.message.includes('23505')) msg = 'Conflicto de registro único.';
            else if (err.message.includes('PGRST')) msg = 'Error de conexión con la base de datos.';
            showMsgElim('❌ ' + msg, 'error');
        } finally {
            btnEliminar.disabled = false;
            btnEliminar.textContent = '🗑️ Eliminar Vehículo del Sistema';
        }
    });
};
