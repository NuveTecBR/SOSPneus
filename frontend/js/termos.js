import { apiFetch, escapeHtml } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-lgpd-sos');
  const fb = document.getElementById('lgpd-sos-fb');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/lgpd', {
        method: 'POST',
        body: JSON.stringify({
          nome_titular: document.getElementById('lgpd-nome').value,
          email_titular: document.getElementById('lgpd-email').value,
          tipo_direito: document.getElementById('lgpd-tipo').value
        })
      });
      fb.innerHTML = `<div style="color: #4ADE80; font-weight: 700;">✓ Protocolo: ${escapeHtml(res.protocolo)}. ${escapeHtml(res.prazo_resposta)}</div>`;
      form.reset();
    } catch (err) {
      fb.innerHTML = `<div style="color: var(--danger-red); font-weight: 700;">${escapeHtml(err.message)}</div>`;
    }
  });
});
