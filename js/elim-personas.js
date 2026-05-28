window.initElimPersonas = function() {
    // 🔹 Referencias
    const buscarInput = document.getElementById('buscar-cedula-elim');
    const buscarBtn = document.getElementById('btn-buscar-elim');
    const msgBuscar = document.getElementById('buscar-msg-elim');
    const dataContainer = document.getElementById('elim-data-container');
    const fieldsContainer = document.getElementById('elim-fields');
    const btnEliminar = document.getElementById('btn-eliminar');
    const msgElim = document.getElementById('msg-elim');
    const modal = document.getElementById('elim-modal');
    const btnSi = document.getElementById('btn-confirm-si');
    const btnNo = document.getElementById('btn-confirm-no');

    let currentData = null;
    let currentId = null;

    const showMsg = (el, txt, type) => { el.textContent = txt; el.className = `search-msg ${type}`; el.style.display = 'block'; };
    const hideMsg = (el) => { el.style.display = 'none'; };
    const showMsgElim = (txt, type) => { msgElim.textContent = txt; msgElim.className = `msg ${type}`; msgElim.style.display = 'block'; };

    // 🔹 Mapeo de campos para visualización
    const camposVis = [
        { id: 'p_nombre1', label: 'Primer Nombre' }, { id: 'p_nombre2', label: 'Segundo Nombre' },
        { id: 'p_apellido1', label: 'Primer Apellido' }, { id: 'p_apellido2', label: 'Segundo Apellido' },
        { id: 'p_cedula', label: 'Cédula' }, { id: 'p_fecha_nac', label: 'Fecha Nacimiento' },
        { id: 'p_edad', label: 'Edad' }, { id: 'p_nacionalidad', label: 'Nacionalidad' },
        { id: 'p_sexo', label: 'Sexo' }, { id: 'p_tlf_pais', label: 'Código Tel.' },
        { id: 'p_tlf_num', label: 'Teléfono' }, { id: 'p_direccion', label: 'Dirección' },
        { id: 'p_direccion_detencion', label: 'Dir. Detención' }, { id: 'p_estatura_cm', label: 'Estatura (cm)' },
        { id: 'p_color_piel', label: 'Color Piel' }, { id: 'p_color_ojos', label: 'Color Ojos' },
        { id: 'p_color_cabello', label: 'Color Cabello' }, { id: 'p_complexion', label: 'Complexión' },
        { id: 'p_estacion', label: 'Estación' }, { id: 'p_observaciones', label: 'Observaciones' }
    ];

    // 🔹 Función de búsqueda
    async function buscarPersona() {
        const cedula = buscarInput.value.trim().replace(/\D/g, '');
        if (cedula.length < 7) return showMsg(msgBuscar, '⚠️ Ingrese entre 7 y 8 dígitos', 'error');
        showMsg(msgBuscar, '🔍 Buscando...', 'success');
        buscarBtn.disabled = true; dataContainer.style.display = 'none'; hideMsg(msgElim);

        try {
            const { data, error } = await window.supabaseClient.from('registro_personas').select('*').eq('cedula', cedula).single();
            if (error || !data) { showMsg(msgBuscar, '❌ Persona no encontrada en el sistema.', 'error'); return; }
            
            currentData = data;
            currentId = data.id;
            hideMsg(msgBuscar);
            
            // Generar campos de solo lectura
            fieldsContainer.innerHTML = '';
            camposVis.forEach(c => {
                const div = document.createElement('div');
                div.className = 'data-item';
                const val = data[c.id.replace('p_', '')] || (c.id === 'p_tlf_pais' ? data.tlf_pais : data.tlf_numero) || '';
                div.innerHTML = `<label>${c.label}</label><input type="text" value="${val}" readonly>`;
                fieldsContainer.appendChild(div);
            });

            dataContainer.style.display = 'block';
        } catch (err) {
            console.error(err);
            showMsg(msgBuscar, '❌ Error de conexión.', 'error');
        } finally {
            buscarBtn.disabled = false;
        }
    }

    // 🔹 Listeners
    buscarBtn.addEventListener('click', buscarPersona);
    buscarInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarPersona(); } });
    
    btnEliminar.addEventListener('click', () => modal.style.display = 'flex');
    btnNo.addEventListener('click', () => modal.style.display = 'none');

    // 🔹 Lógica de eliminación
    btnSi.addEventListener('click', async () => {
        modal.style.display = 'none';
        btnEliminar.disabled = true;
        btnEliminar.textContent = '⏳ Archivando y eliminando...';
        hideMsg(msgElim);

        try {
            const userId = sessionStorage.getItem('pnb_user_id') || 'user';
            const registroElim = { ...currentData, id_original: currentId, eliminado_por: userId };
            
            // 1. Insertar en tabla eliminados
            const { error: insError } = await window.supabaseClient.from('eliminados').insert([registroElim]);
            if (insError) throw insError;

            // 2. Eliminar de registro_personas
            const { error: delError } = await window.supabaseClient.from('registro_personas').delete().eq('id', currentId);
            if (delError) throw delError;

            showMsgElim(`✅ Persona eliminada y archivada correctamente.`, 'success');
            setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsg(msgElim); }, 4000);
        } catch (err) {
            console.error('Error eliminando:', err);
            let msg = 'Error al eliminar. Intente nuevamente.';
            if (err.message.includes('violates')) msg = 'Conflicto de base de datos. Contacte a soporte.';
            showMsgElim('❌ ' + msg, 'error');
        } finally {
            btnEliminar.disabled = false;
            btnEliminar.textContent = '🗑️ Eliminar Persona del Sistema';
        }
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
};
