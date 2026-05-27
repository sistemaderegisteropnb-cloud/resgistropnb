// ✅ Función global que dashboard.js llamará automáticamente
window.initConsulta = function() {
    const btn = document.getElementById('btn-search');
    const input = document.getElementById('search-input');
    const select = document.getElementById('search-type');
    const results = document.getElementById('search-results');

    if (!btn) return;

    async function buscar() {
        const tipo = select.value;
        const term = input.value.trim();
        if (!term) { results.innerHTML = '<div class="placeholder">⚠️ Ingrese un término para buscar</div>'; return; }

        results.innerHTML = '<div class="loading">🔍 Buscando...</div>';

        try {
            let html = '';
            if (tipo === 'personas' || tipo === 'todos') {
                const { data, error } = await window.supabaseClient.from('personas')
                    .select('*').or(`cedula.ilike.%${term}%,nombres.ilike.%${term}%,apellidos.ilike.%${term}%`).limit(30);
                if (error) throw error;
                if (data?.length) {
                    html += `<h4 style="color: var(--primary); margin: 10px 0;">👤 Personas (${data.length})</h4>
                             <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;"><thead><tr style="background: #f8fafc; border-bottom: 2px solid var(--beige-border);"><th style="padding: 8px; text-align: left;">Cédula</th><th style="padding: 8px; text-align: left;">Nombre</th><th style="padding: 8px; text-align: left;">Fecha</th></tr></thead><tbody>`;
                    data.forEach(p => html += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">${p.cedula}</td><td style="padding: 8px;">${p.nombres} ${p.apellidos}</td><td style="padding: 8px;">${new Date(p.creado_en).toLocaleDateString()}</td></tr>`);
                    html += `</tbody></table>`;
                }
            }
            // (Agrega lógica para vehículos si lo necesitas)
            results.innerHTML = html || '<div class="placeholder">❌ Sin resultados</div>';
        } catch (err) {
            results.innerHTML = `<div class="placeholder error">❌ Error: ${err.message}</div>`;
        }
    }

    btn.addEventListener('click', buscar);
    input.addEventListener('keypress', e => e.key === 'Enter' && buscar());
};
