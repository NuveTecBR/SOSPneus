function sanitizar(valor, maxLen = 400) {
  if (typeof valor !== 'string') return '';
  return valor.trim().replace(/[<>]/g, '').slice(0, maxLen);
}

export function validarLoginInput(body = {}) {
  const email = sanitizar(body.email, 120).toLowerCase();
  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 6) {
    const err = new Error('Informe credenciais válidas.');
    err.statusCode = 400;
    throw err;
  }
  return { email, senha };
}

export function validarCalculoSocorroInput(body = {}) {
  if (body.sos_website_honeypot && String(body.sos_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const tiposValidos = [
    'Pneu Furado / Troca de Estepe',
    'Pneu Rasgado (Levar Pneu Novo)',
    'Vulcanização na Base',
    'Bateria / Auxílio de Partida'
  ];
  const tipo_emergencia = tiposValidos.includes(body.tipo_emergencia)
    ? body.tipo_emergencia
    : 'Pneu Furado / Troca de Estepe';
  const distancia_km = Math.min(80, Math.max(1, Number(body.distancia_km ?? 5)));

  return { tipo_emergencia, distancia_km };
}

export function validarChamadoSocorroInput(body = {}) {
  if (body.sos_website_honeypot && String(body.sos_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const { tipo_emergencia, distancia_km } = validarCalculoSocorroInput(body);
  const nome_motorista = sanitizar(body.nome_motorista, 100);
  const telefone = sanitizar(body.telefone, 30);
  const localizacao_referencia = sanitizar(body.localizacao_referencia, 220);
  const veiculo_medida = sanitizar(body.veiculo_medida || 'Medida a confirmar no local', 100);
  const consentimento_lgpd = body.consentimento_lgpd === true || body.consentimento_lgpd === 1;

  if (nome_motorista.length < 3) {
    const err = new Error('Informe seu nome (mínimo 3 caracteres).');
    err.statusCode = 400;
    throw err;
  }
  if (telefone.replace(/\D/g, '').length < 10) {
    const err = new Error('Informe um WhatsApp válido com DDD.');
    err.statusCode = 400;
    throw err;
  }
  if (localizacao_referencia.length < 5) {
    const err = new Error('Informe o endereço ou ponto de referência onde o carro está parado.');
    err.statusCode = 400;
    throw err;
  }
  if (!consentimento_lgpd) {
    const err = new Error('É necessário aceitar o termo LGPD para acionar o socorro móvel.');
    err.statusCode = 400;
    throw err;
  }

  return {
    tipo_emergencia,
    distancia_km,
    nome_motorista,
    telefone,
    localizacao_referencia,
    veiculo_medida,
    consentimento_lgpd: 1
  };
}

export function validarLgpdInput(body = {}) {
  const nome_titular = sanitizar(body.nome_titular, 100);
  const email_titular = sanitizar(body.email_titular, 120).toLowerCase();
  const tipo_direito = ['Confirmacao', 'Acesso', 'Correcao', 'Exclusao'].includes(body.tipo_direito)
    ? body.tipo_direito
    : 'Acesso';
  const detalhes = sanitizar(body.detalhes || '', 400);

  if (nome_titular.length < 3 || !email_titular.includes('@')) {
    const err = new Error('Informe nome completo e e-mail válido.');
    err.statusCode = 400;
    throw err;
  }
  return { nome_titular, email_titular, tipo_direito, detalhes };
}
