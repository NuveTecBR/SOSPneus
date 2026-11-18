const TOKEN_KEY = 'sospneus_jwt_token';
const USER_KEY = 'sospneus_user_data';
const COOKIE_KEY = 'sospneus_lgpd_cookies_v1';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function salvarSessao(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obterUsuarioLogado() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function staticDemoFetch(endpoint, options = {}) {
  const { DEMO_DATA } = await import('./demo-data.js');
  const url = new URL(endpoint, 'https://demo.local');
  const path = url.pathname;
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/api/pneus') {
    let list = [...DEMO_DATA.pneus];
    const medida = url.searchParams.get('medida');
    const busca = (url.searchParams.get('busca') || '').toLowerCase();
    if (medida) list = list.filter(p => p.medida === medida);
    if (busca) list = list.filter(p => `${p.marca} ${p.modelo} ${p.medida} ${p.aplicacao_carros}`.toLowerCase().includes(busca));
    return list;
  }

  if (path === '/api/socorro/calcular') {
    const dist = Math.max(0, Number(body.distancia_km || 5));
    const taxas = {
      'Pneu Furado / Troca de Estepe': 95,
      'Pneu Rasgado (Levar Pneu Novo)': 120,
      'Vulcanização na Base': 65,
      'Bateria / Auxílio de Partida': 110
    };
    const base = taxas[body.tipo_emergencia] || 95;
    const naBase = body.tipo_emergencia === 'Vulcanização na Base';
    const desloc = naBase ? 0 : dist * 4.5;
    return {
      distancia_km: dist,
      tempo_chegada_min: naBase ? 0 : Math.min(45, Math.round(14 + dist * 1.8)),
      taxa_saida_servico: base,
      adicional_deslocamento: Number(desloc.toFixed(2)),
      valor_total_estimado: Number((base + desloc).toFixed(2))
    };
  }

  if (path === '/api/socorro/chamados') {
    const calc = await staticDemoFetch('/api/socorro/calcular', { body: JSON.stringify(body) });
    const protocolo = `SOS-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      protocolo,
      calculo: calc,
      whatsapp_url: `https://wa.me/5551999990000?text=${encodeURIComponent(`SOS Pneus 24h (${protocolo})`)}`
    };
  }

  return {};
}

export async function apiFetch(endpoint, options = {}) {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return staticDemoFetch(endpoint, options);
  }

  const token = obterToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erro || `Falha HTTP ${res.status}`);
  }
  return data;
}

export function inicializarCookiesLgpd() {
  if (localStorage.getItem(COOKIE_KEY)) return;
  const bar = document.createElement('aside');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Aviso de Cookies LGPD');
  bar.style.cssText = 'position: fixed; bottom: 84px; left: 16px; right: 16px; max-width: 820px; margin: 0 auto; background: #111827; border: 2px solid #FACC15; border-radius: 14px; padding: 16px 20px; z-index: 950; box-shadow: 0 16px 40px rgba(0,0,0,0.65);';
  bar.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
      <div style="font-size: 0.86rem; color: #E2E8F0; max-width: 60ch;">
        <strong style="color: #FACC15;">🍪 Privacidade e Cookies (LGPD):</strong> Utilizamos apenas cookies essenciais para cálculo de deslocamento e protocolo de socorro. Consulte nossos <a href="/termos.html" style="color: #FACC15; font-weight: 700;">Termos & Direitos LGPD</a>.
      </div>
      <button type="button" id="btnAceitarCookiesSos" class="btn btn-yellow" style="min-height: 38px; padding: 6px 14px;">Concordar</button>
    </div>
  `;
  document.body.appendChild(bar);
  document.getElementById('btnAceitarCookiesSos')?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'aceito');
    bar.remove();
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarCookiesLgpd);
  } else {
    inicializarCookiesLgpd();
  }
}
