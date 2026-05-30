window.initHistorial = function() {
    const countEl = document.getElementById('hist-count');
    const contentEl = document.getElementById('hist-content');
    
    // 🔹 Cargar contador de eliminados (solo admins pueden ver esto)
    window.supabaseClient.from('eliminados').select('id', { count: 'exact' })
        .then(({ count, error }) => {
            if (error) { countEl.textContent = 'Error'; return; }
            countEl.textContent = `${count || 0} registros archivados`;
        });
    
    console.log('✅ Módulo Historial cargado (acceso restringido a administradores)');
};
