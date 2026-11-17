import { Router } from 'express';
import { sosController } from '../controllers/sosController.js';
import { exigirAutenticacao, exigirCargo } from '../middlewares/authMiddleware.js';
import { authRateLimiter, apiPublicLimiter, sosSubmitLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/auth/login', authRateLimiter, sosController.login);
router.post('/auth/logout', sosController.logout);

router.get('/pneus', apiPublicLimiter, sosController.listarPneus);
router.post('/socorro/calcular', apiPublicLimiter, sosController.calcularSocorro);
router.post('/socorro/chamados', sosSubmitLimiter, sosController.criarChamado);
router.post('/lgpd', sosSubmitLimiter, sosController.criarSolicitacaoLgpd);

router.get('/socorro/chamados', exigirAutenticacao, exigirCargo('operador_base', 'socorrista'), sosController.listarChamadosAdmin);
router.patch('/socorro/chamados/:id/status', exigirAutenticacao, exigirCargo('operador_base', 'socorrista'), sosController.atualizarStatusChamadoAdmin);

export default router;
