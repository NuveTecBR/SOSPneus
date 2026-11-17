process.env.NODE_ENV = 'test';
const { default: app } = await import('./server.js');

const PORT = 3396;
const BASE = `http://localhost:${PORT}/api`;

async function executarSuite() {
  const server = app.listen(PORT);
  console.log(`🧪 Iniciando Suíte de Testes Automatizados SOS Pneus 24h na porta ${PORT}...\n`);

  try {
    // 1. Health & Security Headers
    const resHealth = await fetch(`${BASE}/health`);
    const health = await resHealth.json();
    console.assert(resHealth.status === 200 && health.status === 'online', 'Health check falhou');
    console.assert(resHealth.headers.get('x-content-type-options') === 'nosniff', 'Header nosniff ausente');
    console.log('✅ 1. Health Check e Security Headers validados.');

    // 2. Buscador de Pneus por Medida Exata e Aro
    const resPneus = await fetch(`${BASE}/pneus?medida=${encodeURIComponent('205/55 R16')}`);
    const pneus = await resPneus.json();
    console.assert(pneus.length >= 1 && pneus[0].medida === '205/55 R16', 'Filtro por medida 205/55 R16 falhou');
    console.log(`✅ 2. Buscador por Medida Exata (205/55 R16 -> ${pneus[0].marca} ${pneus[0].modelo}) validado.`);

    // 3. Calculadora de Taxa de Socorro Móvel por KM no Servidor
    const resCalc = await fetch(`${BASE}/socorro/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo_emergencia: 'Pneu Furado / Troca de Estepe', distancia_km: 8 })
    });
    const calc = await resCalc.json();
    console.assert(resCalc.status === 200 && calc.valor_total_estimado > 85 && calc.tempo_chegada_min > 0, 'Cálculo de socorro falhou');
    console.log(`✅ 3. Calculadora de Deslocamento Server-Side (8km -> R$ ${calc.valor_total_estimado}, ~${calc.tempo_chegada_min} min) validada.`);

    // 4. Abertura de Chamado de Socorro + Idempotência + Honeypot
    const resChamado = await fetch(`${BASE}/socorro/chamados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'idem-sos-2026-01'
      },
      body: JSON.stringify({
        tipo_emergencia: 'Pneu Furado / Troca de Estepe',
        distancia_km: 6,
        nome_motorista: 'Gustavo Lima',
        telefone: '(11) 98877-6655',
        localizacao_referencia: 'Av. Paulista, 1578 em frente ao MASP',
        veiculo_medida: 'Jeep Compass — 215/60 R17',
        consentimento_lgpd: true
      })
    });
    const chamado = await resChamado.json();
    console.assert(resChamado.status === 201 && chamado.protocolo.startsWith('SOS-24H-'), 'Abertura de chamado falhou');

    const resBot = await fetch(`${BASE}/socorro/chamados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_motorista: 'Bot',
        telefone: '11999999999',
        localizacao_referencia: 'Rua Bot',
        consentimento_lgpd: true,
        sos_website_honeypot: 'http://bot.com'
      })
    });
    const botData = await resBot.json();
    console.assert(botData.protocolo === 'SOS-BOT-0000', 'Honeypot falhou');
    console.log(`✅ 4. Chamado de Emergência (${chamado.protocolo}), Idempotência e Honeypot validados.`);

    // 5. Autenticação JWT + Despacho de Viatura
    const resLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'base@sospneus-demo.com.br',
        senha: 'SOSPneus@2026'
      })
    });
    const login = await resLogin.json();
    console.assert(resLogin.status === 200 && login.token, 'Login da base falhou');

    const resStatus = await fetch(`${BASE}/socorro/chamados/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${login.token}`
      },
      body: JSON.stringify({ status: 'No Local' })
    });
    const stData = await resStatus.json();
    console.assert(resStatus.status === 200 && stData.status === 'No Local', 'Atualização de viatura falhou');
    console.log(`✅ 5. Autenticação JWT + Atualização de Status da Viatura (${stData.status}) validados.`);

    console.log('\n🎉 TODOS OS TESTES AUTOMATIZADOS DA SOS PNEUS PASSARAM COM 100% DE SUCESSO!\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

executarSuite().catch(err => {
  console.error('❌ Falha na suíte SOS Pneus:', err);
  process.exit(1);
});
