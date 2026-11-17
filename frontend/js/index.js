import { apiFetch, escapeHtml } from './api.js';

let medidaAtiva = 'Todas';
let debounceTimer = null;

function formatarMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function atualizarCalculoSocorro() {
  const box = document.getElementById('sos-eta-box');
  const tipo_emergencia = document.getElementById('sos-emergencia')?.value;
  const distancia_km = Number(document.getElementById('sos-distancia')?.value || 5);

  try {
    const calc = await apiFetch('/api/socorro/calcular', {
      method: 'POST',
      body: JSON.stringify({ tipo_emergencia, distancia_km })
    });

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.85rem; font-weight: 700;">
          ⏱️ Chegada Estimada: <strong style="color: var(--primary-yellow);">${calc.tempo_chegada_min === 0 ? 'Imediato na Base' : `~${calc.tempo_chegada_min} minutos`}</strong>
        </span>
        <strong style="font-family: var(--font-mono); font-size: 1.35rem; color: var(--primary-yellow);">
          ${formatarMoeda(calc.valor_total_estimado)}
        </strong>
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
        Serviço base: ${formatarMoeda(calc.taxa_saida_servico)} + Deslocamento (${calc.distancia_km}km): ${formatarMoeda(calc.adicional_deslocamento)}
      </div>
    `;
  } catch (err) {
    box.innerHTML = `<span style="color: var(--danger-red); font-weight: 700;">${escapeHtml(err.message)}</span>`;
  }
}

async function carregarPneus() {
  const grid = document.getElementById('pneus-grid');
  const contador = document.getElementById('contador-pneus');

  grid.innerHTML = Array.from({ length: 3 }).map(() => `<div class="skeleton-tire" aria-hidden="true"></div>`).join('');

  try {
    const params = new URLSearchParams();
    if (medidaAtiva !== 'Todas') params.set('medida', medidaAtiva);
    const busca = document.getElementById('busca-pneu-input')?.value.trim();
    if (busca) params.set('busca', busca);

    const lista = await apiFetch(`/api/pneus?${params.toString()}`);
    contador.textContent = `${lista.length} medidas em estoque`;

    if (lista.length === 0) {
      grid.innerHTML = `
        <div class="tire-card">
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px;">Nenhuma medida encontrada para este filtro</h3>
          <p style="font-family: var(--font-serif); color: var(--text-muted); margin-bottom: 14px;">
            Limpe a seleção para visualizar todas as medidas disponíveis na base 24h.
          </p>
          <button type="button" id="btn-reset-medidas" class="btn btn-yellow">Mostrar Todas as Medidas</button>
        </div>
      `;
      document.getElementById('btn-reset-medidas')?.addEventListener('click', () => {
        medidaAtiva = 'Todas';
        document.getElementById('busca-pneu-input').value = '';
        document.querySelectorAll('.size-pill').forEach(p => {
          const isT = p.getAttribute('data-medida') === 'Todas';
          p.classList.toggle('active', isT);
          p.setAttribute('aria-pressed', isT ? 'true' : 'false');
        });
        carregarPneus();
      });
      return;
    }

    grid.innerHTML = lista.map(p => `
      <article class="tire-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="tire-measure-tag">${escapeHtml(p.medida)}</span>
          <span style="font-size: 0.78rem; color: #4ADE80; font-weight: 700;">● ${p.estoque} unid. na base</span>
        </div>
        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 4px;">
          ${escapeHtml(p.marca)} ${escapeHtml(p.modelo)}
        </h3>
        <span style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">
          Índice ${escapeHtml(p.indice_carga_vel)} • ${escapeHtml(p.selo_inmetro)}
        </span>
        <p style="font-family: var(--font-serif); font-size: 0.88rem; color: var(--text-body); margin-bottom: 16px;">
          <strong>Aplicação principal:</strong> ${escapeHtml(p.aplicacao_carros)}
        </p>
        <div class="tire-card-footer">
          <div>
            <span style="font-size: 0.74rem; color: var(--text-muted); display: block; text-transform: uppercase;">Unitário Montado</span>
            <strong style="font-family: var(--font-mono); font-size: 1.35rem; color: var(--primary-yellow);">${formatarMoeda(p.preco_unitario)}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Jogo c/ 4: ${formatarMoeda(p.preco_kit4)}</span>
          </div>
          <button type="button" class="btn btn-yellow btn-pedir-pneu" data-medida="${escapeHtml(p.marca)} ${escapeHtml(p.modelo)} (${escapeHtml(p.medida)})" style="min-height: 42px; padding: 8px 14px; font-size: 0.88rem;">
            Pedir Este Pneu
          </button>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.btn-pedir-pneu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const med = e.currentTarget.getAttribute('data-medida');
        document.getElementById('sos-emergencia').value = 'Pneu Rasgado (Levar Pneu Novo)';
        document.getElementById('sos-medida').value = med;
        atualizarCalculoSocorro();
        document.getElementById('sos-nome')?.focus();
      });
    });
  } catch (err) {
    grid.innerHTML = `
      <div class="tire-card">
        <p style="color: var(--danger-red); font-weight: 700;">${escapeHtml(err.message)}</p>
        <button type="button" id="btn-retry-pneus" class="btn btn-yellow" style="margin-top: 10px;">Tentar Novamente</button>
      </div>
    `;
    document.getElementById('btn-retry-pneus')?.addEventListener('click', carregarPneus);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarCalculoSocorro();
  carregarPneus();

  document.getElementById('sos-emergencia')?.addEventListener('change', atualizarCalculoSocorro);
  document.getElementById('sos-distancia')?.addEventListener('input', atualizarCalculoSocorro);

  document.getElementById('busca-pneu-input')?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(carregarPneus, 260);
  });

  document.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.size-pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      medidaAtiva = pill.getAttribute('data-medida');
      carregarPneus();
    });
  });

  document.getElementById('form-despacho-sos')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = document.getElementById('sos-feedback');
    const btn = document.getElementById('btn-submit-sos');
    btn.disabled = true;

    try {
      const res = await apiFetch('/api/socorro/chamados', {
        method: 'POST',
        body: JSON.stringify({
          tipo_emergencia: document.getElementById('sos-emergencia').value,
          distancia_km: Number(document.getElementById('sos-distancia').value || 5),
          nome_motorista: document.getElementById('sos-nome').value,
          telefone: document.getElementById('sos-telefone').value,
          localizacao_referencia: document.getElementById('sos-local').value,
          veiculo_medida: document.getElementById('sos-medida').value,
          consentimento_lgpd: document.getElementById('sos-lgpd').checked,
          sos_website_honeypot: document.getElementById('sos_website_honeypot').value
        })
      });

      fb.innerHTML = `
        <div style="background: rgba(34, 197, 94, 0.16); border: 1.5px solid #22C55E; padding: 14px; border-radius: var(--radius-sm);">
          <strong style="color: #4ADE80; display: block;">✓ Viatura Acionada! Protocolo: ${escapeHtml(res.protocolo)}</strong>
          <p style="font-size: 0.85rem; margin: 6px 0 10px;">Previsão de chegada: ~${res.calculo.tempo_chegada_min} min.</p>
          <a href="${res.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="btn btn-green" style="width: 100%;">
            Enviar Localização no WhatsApp da Viatura
          </a>
        </div>
      `;
      btn.textContent = 'Socorro Acionado ✓';
    } catch (err) {
      fb.innerHTML = `<div style="color: var(--danger-red); font-weight: 700;">${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
    }
  });
});
