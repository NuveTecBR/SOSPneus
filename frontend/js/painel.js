import { apiFetch, escapeHtml, salvarSessao, obterUsuarioLogado, limparSessao } from './api.js';

const secLogin = document.getElementById('sec-login-sos');
const secPainel = document.getElementById('sec-painel-sos');

async function renderizarEstado() {
  const u = obterUsuarioLogado();
  if (!u) {
    secLogin.style.display = 'block';
    secPainel.style.display = 'none';
    return;
  }
  secLogin.style.display = 'none';
  secPainel.style.display = 'block';
  document.getElementById('sos-user-info').textContent = `Operador em Plantão: ${u.nome}`;
  await carregarChamados();
}

async function carregarChamados() {
  try {
    const chamados = await apiFetch('/api/socorro/chamados');
    const container = document.getElementById('lista-chamados-admin');
    container.innerHTML = chamados.map(c => `
      <div class="tire-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="tire-measure-tag">${escapeHtml(c.protocolo)} • ${escapeHtml(c.tipo_emergencia)}</span>
            <div style="font-size: 1.15rem; font-weight: 700;">Motorista: ${escapeHtml(c.nome_motorista)} (${escapeHtml(c.telefone)})</div>
            <div style="font-size: 0.9rem; color: var(--text-body);">
              📍 Local: ${escapeHtml(c.localizacao_referencia)} (${c.distancia_km}km — ~${c.tempo_chegada_min} min) | Medida: ${escapeHtml(c.veiculo_medida)}
            </div>
          </div>
          <div>
            <label for="st-ch-${c.id}" class="form-label">Status Viatura:</label>
            <select id="st-ch-${c.id}" class="form-select sel-status-chamado" data-id="${c.id}" style="width: auto; min-height: 38px;">
              ${['Viatura Acionada', 'Em Deslocamento', 'No Local', 'Concluído'].map(st => `
                <option value="${st}" ${c.status === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.sel-status-chamado').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const status = e.currentTarget.value;
        await apiFetch(`/api/socorro/chamados/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        await carregarChamados();
      });
    });
  } catch {
    limparSessao();
    renderizarEstado();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarEstado();

  document.getElementById('btn-demo-base')?.addEventListener('click', () => {
    document.getElementById('sos-login-email').value = 'base@sospneus-demo.com.br';
    document.getElementById('sos-login-senha').value = 'SOSPneus@2026';
  });

  document.getElementById('btn-demo-frota')?.addEventListener('click', () => {
    document.getElementById('sos-login-email').value = 'viatura01@sospneus-demo.com.br';
    document.getElementById('sos-login-senha').value = 'Resgate@2026';
  });

  document.getElementById('form-login-sos')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = document.getElementById('sos-login-fb');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('sos-login-email').value,
          senha: document.getElementById('sos-login-senha').value
        })
      });
      salvarSessao(res.token, res.usuario);
      await renderizarEstado();
    } catch (err) {
      fb.innerHTML = `<span style="color: var(--danger-red); font-weight: 700;">${escapeHtml(err.message)}</span>`;
    }
  });

  document.getElementById('btn-sair-sos')?.addEventListener('click', async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    limparSessao();
    renderizarEstado();
  });
});
