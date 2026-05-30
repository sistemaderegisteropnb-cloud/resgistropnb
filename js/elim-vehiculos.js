window.initElimVehiculos = function() {
    // 🔹 Referencias DOM
    const buscarInput = document.getElementById('buscar-input-elim');
    const buscarBtn = document.getElementById('btn-buscar-elim');
    const msgBuscar = document.getElementById('buscar-msg-elim');
    const archivedNotice = document.getElementById('archived-notice');
    const dataContainer = document.getElementById('elim-data-container');
    const archivedBanner = document.getElementById('archived-banner');
    const btnEliminar = document.getElementById('btn-eliminar');
    const btnReintegrar = document.getElementById('btn-reintegrar');
    const msgElim = document.getElementById('msg-elim');
    const modal = document.getElementById('elim-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const btnYes = document.getElementById('btn-modal-yes');
    const btnNo = document.getElementById('btn-modal-no');

    let currentData = null;
    let isArchived = false;
    let pendingAction = null;

    const showMsg = (el, txt, type) => { el.textContent = txt; el.className = `search-msg ${type}`; el.style.display = 'block'; };
    const hideMsg = (el) => { el.style.display = 'none'; };
    const showMsgElim = (txt, type) => { msgElim.textContent = txt; msgElim.className = `msg ${type}`; msgElim.style.display = 'block'; };
    const hideMsgElim = () => { msgElim.style.display = 'none'; };
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = (val !== null && val !== undefined && val !== '') ? val : '-'; };
    const setPhoto = (imgId, url) => { const img = document.getElementById(imgId); if (img) { img.src = url || ''; img.style.display = url ? 'block' : 'none'; } };

    //  Función para mostrar datos + UI según estado
    function renderUI(data, archivado = false) {
        isArchived = archivado;
        currentData = data;
        hideMsg(msgBuscar);
        
        // Fotos
        setPhoto('elim-foto-frontal', data.foto_frontal);
        setPhoto('elim-foto-trasera', data.foto_trasera);
        setPhoto('elim-foto-der', data.foto_lado_derecho);
        setPhoto('elim-foto-izq', data.foto_lado_izquierdo);

        // Campos comunes
        setVal('elim-placa', data.placa); setVal('elim-serial-carro', data.serial_carroceria);
        setVal('elim-serial-motor', data.serial_motor); setVal('elim-color', data.color);
        setVal('elim-marca', data.marca); setVal('elim-modelo', data.modelo);
        setVal('elim-anio', data.anio); 
        setVal('elim-tipo', data.tipo_vehiculo || 'Automóvil');
        setVal('elim-estacion', data.estacion_policial); setVal('elim-dir-det', data.direccion_detencion);
        setVal('elim-estatus', data.estatus || 'Verificación'); setVal('elim-obs', data.observaciones);
        
        // Cilindraje solo si es moto
        const esMoto = data.tipo_vehiculo === 'Motocicleta';
        document.getElementById('box-cilindro').style.display = (esMoto && data.cilindraje) ? 'block' : 'none';
        if (data.cilindraje) setVal('elim-cilindraje', data.cilindraje);

        // ✅ Lógica de UI para Archivados vs Activos
        if (archivado) {
            archivedBanner.style.display = 'block';
            archivedNotice.style.display = 'block';
            
            // Cargar fecha y usuario del archivado
            const fecha = data.eliminado_en ? new Date(data.eliminado_en).toLocaleDateString('es-VE') : 'Fecha desconocida';
            const usuario = data.eliminado_por || 'Sistema';
            
            document.getElementById('archived-date').textContent = fecha;
            document.getElementById('archived-by').textContent = usuario;
            
            btnEliminar.style.display = 'none';
            btnReintegrar.style.display = 'block';
        } else {
            archivedBanner.style.display = 'none';
            archivedNotice.style.display = 'none';
            btnEliminar.style.display = 'block';
            btnReintegrar.style.display = 'none';
        }
        dataContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 🔹 Búsqueda principal (Activos → Archivados)
    async function buscarVehiculo() {
        const val = buscarInput.value.trim().toUpperCase();
        if (val.length < 5) return showMsg(msgBuscar, '⚠️ Ingrese un dato válido (mín. 5 caracteres).', 'error');
        
        showMsg(msgBuscar, ' Buscando...', 'success');
        buscarBtn.disabled = true; dataContainer.style.display = 'none'; hideMsgElim();
        archivedNotice.style.display = 'none'; // Ocultar aviso previo

        try {
            const query = `placa.eq.${val},serial_carroceria.eq.${val},serial_motor.eq.${val}`;
            
            // 1. Buscar en tablas activas
            let { data: moto } = await window.supabaseClient.from('registro_motos').select('*').or(query).maybeSingle();
            if (moto) { renderUI(moto, false); return; }
            
            let { data: auto } = await window.supabaseClient.from('registro_automoviles').select('*').or(query).maybeSingle();
            if (auto) { renderUI(auto, false); return; }

            // 2. Buscar en eliminados (Archivados)
            let { data: arch } = await window.supabaseClient.from('vehiculos_eliminados').select('*').or(query).maybeSingle();
            if (arch) { renderUI(arch, true); return; }

            showMsg(msgBuscar, '❌ Vehículo no encontrado.', 'error');
        } catch (err) {
            console.error(err);
            showMsg(msgBuscar, ' Error de conexión.', 'error');
        } finally { buscarBtn.disabled = false; }
    }

    // 🔹 Modal genérico
    function showModal(titulo, texto, accion, tipo = 'danger') {
        pendingAction = accion;
        modalTitle.textContent = titulo;
        modalText.textContent = texto;
        btnYes.className = tipo === 'danger' ? 'btn-modal-danger' : 'btn-modal-success';
        btnYes.textContent = tipo === 'danger' ? '✅ Sí, Eliminar' : '✅ Sí, Reintegrar';
        modal.style.display = 'flex';
    }

    function closeModal() { modal.style.display = 'none'; pendingAction = null; }

    async function ejecutarAccion() {
        if (pendingAction === 'delete') await eliminarRegistro();
        else if (pendingAction === 'reintegrate') await reintegrarRegistro();
        closeModal();
    }

    // 🔹 Eliminar (Activa → Eliminados)
    async function eliminarRegistro() {
        btnEliminar.disabled = true; btnEliminar.textContent = '⏳ Archivando...'; hideMsgElim();
        try {
            const userId = sessionStorage.getItem('pnb_user_id') || 'user';
            const tipo = document.getElementById('elim-tipo').value;
            const tablaActiva = tipo === 'Motocicleta' ? 'registro_motos' : 'registro_automoviles';

            const registroElim = {
                id_original: currentData.id, tabla_origen: tablaActiva, tipo_vehiculo: tipo,
                placa: currentData.placa, marca: currentData.marca, modelo: currentData.modelo,
                anio: currentData.anio, color: currentData.color, serial_carroceria: currentData.serial_carroceria,
                serial_motor: currentData.serial_motor, cilindraje: currentData.cilindraje || null,
                direccion_detencion: currentData.direccion_detencion || null,
                estacion_policial: currentData.estacion_policial, estatus: currentData.estatus,
                observaciones: currentData.observaciones || null,
                foto_frontal: currentData.foto_frontal, foto_trasera: currentData.foto_trasera,
                foto_lado_derecho: currentData.foto_lado_derecho, foto_lado_izquierdo: currentData.foto_lado_izquierdo,
                eliminado_por: userId
            };

            const { error: insErr } = await window.supabaseClient.from('vehiculos_eliminados').insert([registroElim]);
            if (insErr) throw insErr;

            const { error: delErr } = await window.supabaseClient.from(tablaActiva).delete().eq('id', currentData.id);
            if (delErr) throw delErr;

            showMsgElim('✅ Vehículo eliminado y archivado correctamente.', 'success');
            setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); archivedNotice.style.display = 'none'; }, 4000);
        } catch (err) {
            console.error('Error eliminando:', err);
            showMsgElim('❌ ' + (err.message || 'Error al eliminar.'), 'error');
        } finally { btnEliminar.disabled = false; btnEliminar.textContent = '🗑️ Eliminar Vehículo del Sistema'; }
    }

    // 🔹 Reintegrar (Eliminados → Activa)
    async function reintegrarRegistro() {
        btnReintegrar.disabled = true; btnReintegrar.textContent = ' Reintegrando...'; hideMsgElim();
        try {
            const userId = sessionStorage.getItem('pnb_user_id') || 'user';
            // Determinar tabla de destino basada en el tipo guardado
            const tablaDestino = currentData.tabla_origen || (currentData.tipo_vehiculo === 'Motocicleta' ? 'registro_motos' : 'registro_automoviles');

            const dataActiva = {
                estatus: currentData.estatus, estacion_policial: currentData.estacion_policial,
                direccion_detencion: currentData.direccion_detencion, observaciones: currentData.observaciones,
                placa: currentData.placa, marca: currentData.marca, modelo: currentData.modelo,
                anio: currentData.anio, color: currentData.color, serial_carroceria: currentData.serial_carroceria,
                serial_motor: currentData.serial_motor, cilindraje: currentData.cilindraje || null,
                foto_frontal: currentData.foto_frontal, foto_trasera: currentData.foto_trasera,
                foto_lado_derecho: currentData.foto_lado_derecho, foto_lado_izquierdo: currentData.foto_lado_izquierdo
            };

            const { error: insErr } = await window.supabaseClient.from(tablaDestino).insert([dataActiva]);
            if (insErr) throw insErr;

            // Actualizar auditoría y eliminar de eliminados
            await window.supabaseClient.from('vehiculos_eliminados')
                .update({ reintegrado_en: new Date().toISOString(), reintegrado_por: userId })
                .eq('id', currentData.id);
            await window.supabaseClient.from('vehiculos_eliminados').delete().eq('id', currentData.id);

            showMsgElim('✅ Vehículo reintegrado al sistema activo.', 'success');
            setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); archivedNotice.style.display = 'none'; }, 4000);
        } catch (err) {
            console.error('Error reintegrando:', err);
            let msg = 'Error al reintegrar.';
            if (err.message.includes('23505')) msg = 'Esta placa ya existe en el sistema activo.';
            showMsgElim('❌ ' + msg, 'error');
        } finally { btnReintegrar.disabled = false; btnReintegrar.textContent = '♻️ Reintegrar al Sistema Activo'; }
    }

    // 🔹 Listeners
    buscarBtn.addEventListener('click', buscarVehiculo);
    buscarInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarVehiculo(); } });
    
    btnEliminar.addEventListener('click', () => showModal('⚠️ Confirmar Eliminación', `¿Eliminar placa ${currentData.placa}? Se archivará permanentemente.`, 'delete', 'danger'));
    btnReintegrar.addEventListener('click', () => showModal('♻️ Confirmar Reintegración', `¿Reintegrar placa ${currentData.placa}? Volverá al sistema activo.`, 'reintegrate', 'success'));

    btnYes.addEventListener('click', ejecutarAccion);
    btnNo.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
};
