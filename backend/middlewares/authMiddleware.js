import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET ausente.');
  return s;
}

function extrairCookieToken(req) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const m = raw.split(';').map(c => c.trim()).find(c => c.startsWith('sospneus_session='));
  return m ? decodeURIComponent(m.split('=')[1]) : null;
}

export function exigirAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : extrairCookieToken(req);

  if (!token) return res.status(401).json({ erro: 'Autenticação necessária na Base SOS Pneus.' });

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: payload.id, nome: payload.nome, email: payload.email, cargo: payload.cargo };
    next();
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
}

export function exigirCargo(...cargos) {
  return (req, res, next) => {
    if (!req.user || !cargos.includes(req.user.cargo)) {
      return res.status(403).json({ erro: 'Sem permissão para esta operação.' });
    }
    next();
  };
}
