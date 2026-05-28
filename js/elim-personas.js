window.initElimPersonas = function() {
    // 🔹 Referencias DOM
    const buscarInput = document.getElementById('buscar-cedula-elim');
    const buscarBtn = document.getElementById('btn-buscar-elim');
    const msgBuscar = document.getElementById('buscar-msg-elim');
    const dataContainer = document.getElementById('elim-data-container');
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
    const hideMsgElim = () => { msgElim.style.display = 'none'; };

    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = (val !== null && val !== undefined && val !== '') ? val : '-'; };
    const showField = (id) => { const el = document.getElementById(id); if(el) el.style.display = 'block'; };
    const hideField = (id) => { const el = document.getElementById(id); if(el) el.style.display = 'none'; };
    const setPhoto = (imgId, url) => {
        const img = document.getElementById(imgId);
        if (!img) return;
        if (url) { img.src = url; img.style.display = 'block'; }
        else { img.src = ''; img.style.display = 'none'; }
    };

    async function buscarPersona() {
        const cedula = buscarInput.value.trim().replace(/\D/g, '');
        if (cedula.length < 7) return showMsg(msgBuscar, '⚠️ Ingrese entre 7 y 8 dígitos', 'error');
        showMsg(msgBuscar, '🔍 Buscando...', 'success');
        buscarBtn.disabled = true; dataContainer.style.display = 'none'; hideMsgElim();

        try {
            const { data, error } = await window.supabaseClient.from('registro_personas').select('*').eq('cedula', cedula).single();
            if (error || !data) { showMsg(msgBuscar, '❌ Persona no encontrada en el sistema.', 'error'); return; }
            
            currentData = data;
            currentId = data.id;
            hideMsg(msgBuscar);

            // Fotos
            setPhoto('elim-foto-frontal', data.foto_frontal);
            setPhoto('elim-foto-izq', data.foto_perfil_izq);
            setPhoto('elim-foto-der', data.foto_perfil_der);

            // Datos Personales
            setVal('elim-n1', data.primer_nombre); setVal('elim-n2', data.segundo_nombre);
            setVal('elim-a1', data.primer_apellido); setVal('elim-a2', data.segundo_apellido);
            setVal('elim-cedula', data.cedula); setVal('elim-fnac', data.fecha_nacimiento);
            setVal('elim-edad', data.edad); setVal('elim-apodo', data.apodo);
            setVal('elim-marca', data.marca_corporal); setVal('elim-nac', data.nacionalidad);
            setVal('elim-sexo', data.sexo);

            // Contacto
            setVal('elim-tlf-pais', data.tlf_pais); setVal('elim-tlf-num', data.tlf_numero);
            setVal('elim-dir', data.direccion); setVal('elim-dir-det', data.direccion_detencion);

            // Físico
            setVal('elim-est', data.estatura_cm); setVal('elim-piel', data.color_piel);
            setVal('elim-ojos', data.color_ojos); setVal('elim-cabello', data.color_cabello);
            setVal('elim-comp', data.complexion);

            // Salud / Judicial (lógica condicional)
            setVal('elim-lentes', data.usa_lentes ? 'Sí' : 'No');
            if (data.usa_lentes && data.detalle_lentes) { showField('box-lentes-det'); setVal('elim-lentes-det', data.detalle_lentes); } else { hideField('box-lentes-det'); }

            setVal('elim-perf', data.perforaciones ? 'Sí' : 'No');
            if (data.perforaciones && data.detalle_perforaciones) { showField('box-perf-det'); setVal('elim-perf-det', data.detalle_perforaciones); } else { hideField('box-perf-det'); }

            setVal('elim-cond', data.condicion_medica ? 'Sí' : 'No');
            if (data.condicion_medica) { showField('box-cond-det'); setVal('elim-cond-det', data.condicion_medica); } else { hideField('box-cond-det'); }

            setVal('elim-med', data.consume_medicamento ? 'Sí' : 'No');
            if (data.consume_medicamento) { showField('box-med-det'); setVal('elim-med-det', data.consume_medicamento); } else { hideField('box-med-det'); }

            setVal('elim-jud', data.problema_judicial ? 'Sí' : 'No');
            if (data.problema_judicial) { showField('box-jud-det'); setVal('elim-jud-det', data.problema_judicial); } else { hideField('box-jud-det'); }

            // Registro y Observaciones
            setVal('elim-estacion', data.estacion_policial);
            setVal('elim-obs', data.observaciones);

            dataContainer.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // 🔹 Lógica de eliminación
    btnSi.addEventListener('click', async () => {
        modal.style.display = 'none';
        btnEliminar.disabled = true;
        btnEliminar.textContent = '⏳ Archivando y eliminando...';
        hideMsgElim();

        try {
            const userId = sessionStorage.getItem('pnb_user_id') || 'user';
            const registroElim = { ...currentData, id_original: currentId, eliminado_por: userId };
            
            // 1. Insertar en tabla eliminados
            const { error: insError } = await window.supabaseClient.from('eliminados').insert([registroElim]);
            if (insError) throw insError;

            // 2. Eliminar de registro_personas
            const { error: delError } = await window.supabaseClient.from('registro_personas').delete().eq('id', currentId);
            if (delError) throw delError;

            showMsgElim('✅ Persona eliminada y archivada correctamente.', 'success');
            setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); }, 4000);
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
};
