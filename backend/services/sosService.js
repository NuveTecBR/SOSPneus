import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, query, run } from '../database/conexao.js';

export const sosService = {
  autenticar({ email, senha }) {
    const u = get('SELECT id, nome, email, senha_hash, cargo, criado_em FROM usuarios WHERE email = ?', [email]);
    if (!u || !bcrypt.compareSync(senha, u.senha_hash)) {
      const err = new Error('Credenciais inválidas.');
      err.statusCode = 401;
      throw err;
    }
    const usuario = { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, criado_em: u.criado_em };
    const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, usuario };
  },

  listarPneus(filtros = {}) {
    let sql = 'SELECT * FROM pneus WHERE 1=1';
    const params = [];

    if (filtros.medida && filtros.medida !== 'Todas') {
      sql += ' AND medida = ?';
      params.push(String(filtros.medida));
    }
    if (filtros.aro && Number(filtros.aro) > 0) {
      sql += ' AND aro = ?';
      params.push(Number(filtros.aro));
    }
    if (filtros.busca && String(filtros.busca).trim() !== '') {
      const t = `%${String(filtros.busca).trim()}%`;
      sql += ' AND (medida LIKE ? OR marca LIKE ? OR modelo LIKE ? OR aplicacao_carros LIKE ?)';
      params.push(t, t, t, t);
    }

    sql += ' ORDER BY destaque DESC, aro ASC, preco_unitario ASC';
    return query(sql, params);
  },

  calcularTaxaSocorro({ tipo_emergencia, distancia_km }) {
    const tabelaBase = {
      'Pneu Furado / Troca de Estepe': 85.00,
      'Pneu Rasgado (Levar Pneu Novo)': 110.00,
      'Vulcanização na Base': 65.00,
      'Bateria / Auxílio de Partida': 95.00
    };

    const valorBase = tabelaBase[tipo_emergencia] || 85.00;
    const custoKm = tipo_emergencia === 'Vulcanização na Base' ? 0 : Number((distancia_km * 6.50).toFixed(2));
    const valorTotal = Number((valorBase + custoKm).toFixed(2));
    const tempoChegadaMin = tipo_emergencia === 'Vulcanização na Base'
      ? 0
      : Math.min(60, Math.round(10 + distancia_km * 2.2));

    return {
      tipo_emergencia,
      distancia_km,
      taxa_saida_servico: valorBase,
      adicional_deslocamento: custoKm,
      valor_total_estimado: valorTotal,
      tempo_chegada_min: tempoChegadaMin
    };
  },

  registrarChamado(dados) {
    const calculo = this.calcularTaxaSocorro({
      tipo_emergencia: dados.tipo_emergencia,
      distancia_km: dados.distancia_km
    });

    const protocolo = `SOS-24H-${Math.floor(1000 + Math.random() * 9000)}`;
    const res = run(
      `INSERT INTO chamados_socorro (
        protocolo, tipo_emergencia, distancia_km, tempo_chegada_min, valor_total_estimado,
        nome_motorista, telefone, localizacao_referencia, veiculo_medida, consentimento_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Viatura Acionada')`,
      [
        protocolo,
        dados.tipo_emergencia,
        dados.distancia_km,
        calculo.tempo_chegada_min,
        calculo.valor_total_estimado,
        dados.nome_motorista,
        dados.telefone,
        dados.localizacao_referencia,
        dados.veiculo_medida,
        dados.consentimento_lgpd
      ]
    );

    const textoWhats = encodeURIComponent(
      `🚨 *CHAMADO URGENTE SOS PNEUS 24H — ${protocolo}*\n` +
      `• Ocorrência: ${dados.tipo_emergencia}\n` +
      `• Localização: ${dados.localizacao_referencia} (~${dados.distancia_km}km)\n` +
      `• Veículo / Medida: ${dados.veiculo_medida}\n` +
      `• Previsão Chegada: ~${calculo.tempo_chegada_min} min | Valor: R$ ${calculo.valor_total_estimado.toLocaleString('pt-BR')}\n` +
      `• Motorista: ${dados.nome_motorista}`
    );

    return {
      id: res.lastInsertRowid,
      protocolo,
      calculo,
      whatsapp_url: `https://wa.me/5511977772424?text=${textoWhats}`,
      mensagem: 'Furgão de socorro notificado com sucesso!'
    };
  },

  listarChamados() {
    return query('SELECT * FROM chamados_socorro ORDER BY id DESC');
  },

  atualizarStatusChamado(id, status) {
    if (!['Viatura Acionada', 'Em Deslocamento', 'No Local', 'Concluído'].includes(status)) {
      const err = new Error('Status inválido.');
      err.statusCode = 400;
      throw err;
    }
    const ch = get('SELECT id FROM chamados_socorro WHERE id = ?', [Number(id)]);
    if (!ch) {
      const err = new Error('Chamado não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    run('UPDATE chamados_socorro SET status = ? WHERE id = ?', [status, Number(id)]);
    return get('SELECT * FROM chamados_socorro WHERE id = ?', [Number(id)]);
  },

  registrarLgpd(dados) {
    const protocolo = `LGPD-SOS-${Math.floor(10000 + Math.random() * 90000)}`;
    run(
      'INSERT INTO solicitacoes_lgpd (protocolo, nome_titular, email_titular, tipo_direito, detalhes) VALUES (?, ?, ?, ?, ?)',
      [protocolo, dados.nome_titular, dados.email_titular, dados.tipo_direito, dados.detalhes]
    );
    return {
      protocolo,
      status: 'Recebido pelo DPO SOS Pneus',
      prazo_resposta: 'Até 15 dias conforme Art. 18 da LGPD.'
    };
  }
};
