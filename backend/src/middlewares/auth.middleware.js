// backend/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
}

export function esAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }
    next();
}