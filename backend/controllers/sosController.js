import { sosService } from '../services/sosService.js';
import {
  validarLoginInput,
  validarCalculoSocorroInput,
  validarChamadoSocorroInput,
  validarLgpdInput
} from '../validators/schemas.js';

const idempotencyCache = new Map();

export const sosController = {
  login(req, res, next) {
    try {
      const cred = validarLoginInput(req.body);
      const resultado = sosService.autenticar(cred);
      res.cookie('sospneus_session', resultado.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  logout(_req, res) {
    res.clearCookie('sospneus_session', { path: '/' });
    res.json({ sucesso: true });
  },

  listarPneus(req, res, next) {
    try {
      res.json(sosService.listarPneus(req.query));
    } catch (err) {
      next(err);
    }
  },

  calcularSocorro(req, res, next) {
    try {
      const validado = validarCalculoSocorroInput(req.body);
      if (validado.isBotHoneypot) return res.json({ bloqueadoSilenciosamente: true });
      res.json(sosService.calcularTaxaSocorro(validado));
    } catch (err) {
      next(err);
    }
  },

  criarChamado(req, res, next) {
    try {
      const idempKey = req.headers['idempotency-key'];
      if (idempKey && idempotencyCache.has(idempKey)) {
        return res.status(200).json(idempotencyCache.get(idempKey));
      }

      const validado = validarChamadoSocorroInput(req.body);
      if (validado.isBotHoneypot) {
        return res.status(201).json({ protocolo: 'SOS-BOT-0000', mensagem: 'Recebido.' });
      }
      const criado = sosService.registrarChamado(validado);
      if (idempKey) idempotencyCache.set(idempKey, criado);
      res.status(201).json(criado);
    } catch (err) {
      next(err);
    }
  },

  listarChamadosAdmin(_req, res, next) {
    try {
      res.json(sosService.listarChamados());
    } catch (err) {
      next(err);
    }
  },

  atualizarStatusChamadoAdmin(req, res, next) {
    try {
      res.json(sosService.atualizarStatusChamado(req.params.id, req.body?.status));
    } catch (err) {
      next(err);
    }
  },

  criarSolicitacaoLgpd(req, res, next) {
    try {
      const dados = validarLgpdInput(req.body);
      res.status(201).json(sosService.registrarLgpd(dados));
    } catch (err) {
      next(err);
    }
  }
};
