export function notFoundHandler(req, res) {
  res.status(404).json({ erro: `Endpoint não encontrado: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    erro: statusCode === 500 && isProd
      ? 'Erro interno no servidor SOS Pneus. Tente novamente.'
      : (err.message || 'Erro inesperado.')
  });
}
