window.initElimPersonas = function() {
    // 🔹 Referencias DOM
    const buscarInput = document.getElementById('buscar-cedula-elim');
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
    const btnConfirmYes = document.getElementById('btn-confirm-yes');
    const btnConfirmNo = document.getElementById('btn-confirm-no');

    let currentData = null;
    let currentId = null;
    let isArchived = false; // true si viene de tabla 'eliminados'

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

    // 🔹 Función para mostrar datos (reutilizable para activo o archivado)
    function mostrarDatos(data, desdeArchivados = false) {
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

        // Salud / Judicial
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

        // Registro
        setVal('elim-estacion', data.estacion_policial);
        setVal('elim-obs', data.observaciones);

        // Banner de archivado
        if (desdeArchivados) {
            archivedBanner.style.display = 'block';
            document.getElementById('archived-date').textContent = new Date(data.eliminado_en).toLocaleDateString();
            document.getElementById('archived-by').textContent = data.eliminado_por || 'Sistema';
            btnEliminar.style.display = 'none';
            btnReintegrar.style.display = 'block';
        } else {
            archivedBanner.style.display = 'none';
            btnEliminar.style.display = 'block';
            btnReintegrar.style.display = 'none';
        }
    }

    // 🔹 Búsqueda principal
    async function buscarPersona() {
        const cedula = buscarInput.value.trim().replace(/\D/g, '');
        if (cedula.length < 7) return showMsg(msgBuscar, '⚠️ Ingrese entre 7 y 8 dígitos', 'error');
        
        showMsg(msgBuscar, '🔍 Buscando...', 'success');
        buscarBtn.disabled = true; 
        dataContainer.style.display = 'none'; 
        hideMsg(msgElim);
        archivedNotice.style.display = 'none';
        isArchived = false;

        try {
            // 1. Buscar en tabla activa
            let { data: activo, error: errActivo } = await window.supabaseClient
                .from('registro_personas')
                .select('*')
                .eq('cedula', cedula)
                .maybeSingle();
            
            if (activo && !errActivo) {
                // ✅ Encontrado en activa
                currentData = activo;
                currentId = activo.id;
                hideMsg(msgBuscar);
                mostrarDatos(activo, false);
                dataContainer.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // 2. Si no está en activa, buscar en eliminados
            let { data: archivado, error: errArch } = await window.supabaseClient
                .from('eliminados')
                .select('*')
                .eq('cedula', cedula)
                .maybeSingle();
            
            if (archivado && !errArch) {
                // 🔒 Encontrado en archivados
                currentData = archivado;
                currentId = archivado.id_original || archivado.id;
                isArchived = true;
                hideMsg(msgBuscar);
                archivedNotice.style.display = 'block';
                mostrarDatos(archivado, true);
                dataContainer.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // ❌ No encontrado en ninguna tabla
            showMsg(msgBuscar, '❌ Persona no encontrada en el sistema.', 'error');
            
        } catch (err) {
            console.error(err);
            showMsg(msgBuscar, '❌ Error de conexión.', 'error');
        } finally {
            buscarBtn.disabled = false;
        }
    }

    // 🔹 Modal genérico
    function showModal(titulo, texto, onConfirm, tipo = 'danger') {
        modalTitle.textContent = titulo;
        modalText.textContent = texto;
        btnConfirmYes.className = tipo === 'danger' ? 'btn-danger' : 'btn-success';
        btnConfirmYes.textContent = tipo === 'danger' ? '✅ Sí, Eliminar' : '✅ Sí, Reintegrar';
        
        const handler = () => {
            onConfirm();
            cleanup();
        };
        
        const cleanup = () => {
            btnConfirmYes.removeEventListener('click', handler);
            btnConfirmNo.removeEventListener('click', cleanup);
            modal.removeEventListener('click', onModalClick);
        };
        
        const onModalClick = (e) => { if (e.target === modal) cleanup(); modal.style.display = 'none'; };
        
        btnConfirmYes.addEventListener('click', handler);
        btnConfirmNo.addEventListener('click', cleanup);
        modal.addEventListener('click', onModalClick);
        modal.style.display = 'flex';
    }

    // 🔹 Listeners de búsqueda
    buscarBtn.addEventListener('click', buscarPersona);
    buscarInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarPersona(); } });
    
    // 🔹 Acción: Eliminar (de activa a archivados)
    btnEliminar.addEventListener('click', () => {
        showModal(
            '⚠️ Confirmar Eliminación',
            `¿Está seguro que desea eliminar a ${currentData.primer_nombre} ${currentData.primer_apellido} (Cédula: ${currentData.cedula})? El registro se archivará permanentemente.`,
            async () => {
                btnEliminar.disabled = true;
                btnEliminar.textContent = '⏳ Archivando...';
                hideMsgElim();

                try {
                    const userId = sessionStorage.getItem('pnb_user_id') || 'user';
                    
                    // Mapeo explícito de columnas
                    const registroElim = {
                        id_original: currentId,
                        estatus: currentData.estatus, estacion_policial: currentData.estacion_policial,
                        direccion_detencion: currentData.direccion_detencion,
                        foto_frontal: currentData.foto_frontal, foto_perfil_izq: currentData.foto_perfil_izq, foto_perfil_der: currentData.foto_perfil_der,
                        primer_nombre: currentData.primer_nombre, segundo_nombre: currentData.segundo_nombre,
                        primer_apellido: currentData.primer_apellido, segundo_apellido: currentData.segundo_apellido,
                        cedula: currentData.cedula, fecha_nacimiento: currentData.fecha_nacimiento, edad: currentData.edad,
                        tlf_pais: currentData.tlf_pais, tlf_numero: currentData.tlf_numero,
                        direccion: currentData.direccion, apodo: currentData.apodo, marca_corporal: currentData.marca_corporal,
                        nacionalidad: currentData.nacionalidad, sexo: currentData.sexo,
                        estatura_cm: currentData.estatura_cm, color_piel: currentData.color_piel,
                        color_ojos: currentData.color_ojos, color_cabello: currentData.color_cabello, complexion: currentData.complexion,
                        usa_lentes: currentData.usa_lentes, detalle_lentes: currentData.detalle_lentes,
                        perforaciones: currentData.perforaciones, detalle_perforaciones: currentData.detalle_perforaciones,
                        condicion_medica: currentData.condicion_medica, consume_medicamento: currentData.consume_medicamento,
                        problema_judicial: currentData.problema_judicial, observaciones: currentData.observaciones,
                        eliminado_por: userId
                    };
                    
                    // 1. Insertar en eliminados
                    const { error: insError } = await window.supabaseClient.from('eliminados').insert([registroElim]);
                    if (insError) throw insError;

                    // 2. Eliminar de registro_personas
                    const { error: delError } = await window.supabaseClient.from('registro_personas').delete().eq('id', currentData.id);
                    if (delError) throw delError;

                    showMsgElim('✅ Persona eliminada y archivada correctamente.', 'success');
                    setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); archivedNotice.style.display = 'none'; }, 4000);
                } catch (err) {
                    console.error('Error eliminando:', err);
                    let msg = 'Error al eliminar. Intente nuevamente.';
                    if (err.message.includes('PGRST204') || err.message.includes('column')) msg = 'Error de estructura. Ejecute el SQL de actualización.';
                    else if (err.message.includes('violates')) msg = 'Conflicto de base de datos.';
                    showMsgElim('❌ ' + msg, 'error');
                } finally {
                    btnEliminar.disabled = false;
                    btnEliminar.textContent = '🗑️ Eliminar Persona del Sistema';
                }
            },
            'danger'
        );
    });

    // 🔹 Acción: Reintegrar (de archivados a activa)
    btnReintegrar.addEventListener('click', () => {
        showModal(
            '♻️ Confirmar Reintegración',
            `¿Está seguro que desea reintegrar a ${currentData.primer_nombre} ${currentData.primer_apellido}? El registro volverá al sistema activo y podrá ser consultado/eliminado normalmente.`,
            async () => {
                btnReintegrar.disabled = true;
                btnReintegrar.textContent = '⏳ Reintegrando...';
                hideMsgElim();

                try {
                    const userId = sessionStorage.getItem('pnb_user_id') || 'user';
                    
                    // Mapeo para regresar a registro_personas (sin columnas de auditoría de eliminados)
                    const registroActivo = {
                        estatus: currentData.estatus, estacion_policial: currentData.estacion_policial,
                        direccion_detencion: currentData.direccion_detencion,
                        foto_frontal: currentData.foto_frontal, foto_perfil_izq: currentData.foto_perfil_izq, foto_perfil_der: currentData.foto_perfil_der,
                        primer_nombre: currentData.primer_nombre, segundo_nombre: currentData.segundo_nombre,
                        primer_apellido: currentData.primer_apellido, segundo_apellido: currentData.segundo_apellido,
                        cedula: currentData.cedula, fecha_nacimiento: currentData.fecha_nacimiento, edad: currentData.edad,
                        tlf_pais: currentData.tlf_pais, tlf_numero: currentData.tlf_numero,
                        direccion: currentData.direccion, apodo: currentData.apodo, marca_corporal: currentData.marca_corporal,
                        nacionalidad: currentData.nacionalidad, sexo: currentData.sexo,
                        estatura_cm: currentData.estatura_cm, color_piel: currentData.color_piel,
                        color_ojos: currentData.color_ojos, color_cabello: currentData.color_cabello, complexion: currentData.complexion,
                        usa_lentes: currentData.usa_lentes, detalle_lentes: currentData.detalle_lentes,
                        perforaciones: currentData.perforaciones, detalle_perforaciones: currentData.detalle_perforaciones,
                        condicion_medica: currentData.condicion_medica, consume_medicamento: currentData.consume_medicamento,
                        problema_judicial: currentData.problema_judicial, observaciones: currentData.observaciones
                    };
                    
                    // 1. Insertar en registro_personas
                    const { error: insError } = await window.supabaseClient.from('registro_personas').insert([registroActivo]);
                    if (insError) throw insError;

                    // 2. Marcar como reintegrado en eliminados (soft-delete audit)
                    await window.supabaseClient.from('eliminados')
                        .update({ 
                            reintegrado_en: new Date().toISOString(), 
                            reintegrado_por: userId 
                        })
                        .eq('id', currentData.id);

                    // 3. Eliminar de eliminados (opcional: si prefieres mantener historial, comenta esta línea)
                    // await window.supabaseClient.from('eliminados').delete().eq('id', currentData.id);

                    showMsgElim('✅ Persona reintegrada al sistema activo.', 'success');
                    setTimeout(() => { dataContainer.style.display = 'none'; buscarInput.value = ''; hideMsg(msgBuscar); hideMsgElim(); archivedNotice.style.display = 'none'; }, 4000);
                } catch (err) {
                    console.error('Error reintegrando:', err);
                    let msg = 'Error al reintegrar. Intente nuevamente.';
                    if (err.message.includes('23505') || err.message.includes('unique')) msg = 'Esta cédula ya existe en el sistema activo.';
                    else if (err.message.includes('PGRST204')) msg = 'Error de estructura de base de datos.';
                    showMsgElim('❌ ' + msg, 'error');
                } finally {
                    btnReintegrar.disabled = false;
                    btnReintegrar.textContent = '♻️ Reintegrar al Sistema Activo';
                }
            },
            'success'
        );
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
};
