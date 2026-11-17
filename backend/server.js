import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import './database/conexao.js';
import apiRoutes from './routes/apiRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3336);
const frontendPath = path.resolve(__dirname, '../frontend');

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self';"
  );

  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/socorro/chamados')) {
    res.setHeader('Cache-Control', 'private, no-store');
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '512kb' }));
app.use(express.static(frontendPath));

app.use('/api', apiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    projeto: 'SOS Pneus & Borracharia 24h (Portfólio Demonstrativo Nuvetec)',
    arquitetura: 'Método ENDS',
    layout: 'Mobile-First Command Center & Floating Bottom Action Dock',
    dadosFicticios: true,
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🛞 SOS Pneus & Borracharia 24h operando na porta ${PORT} -> http://localhost:${PORT}`);
  });
}

export default app;
