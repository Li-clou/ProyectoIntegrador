import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // { id_usuario, usuario } segun lo que firmaste en el login
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
}