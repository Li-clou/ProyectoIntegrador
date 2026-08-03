import { loginUsuario } from '../services/auth.service.js';
import { buscarPorUsuario } from '../models/auth.model.js';

export async function login(req, res) {
    try {
        const { usuario, password } = req.body;
        if (!usuario || !password) return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        const resultado = await loginUsuario({ usuario, password });
        if (!resultado) return res.status(401).json({ error: 'Credenciales inválidas' });
        if (!['admin', 'cajero'].includes(resultado.usuario.rol)) {
            return res.status(403).json({ error: 'La cuenta no tiene acceso al sistema' });
        }
        res.cookie('token', resultado.token, {
            httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000,
        });
        res.json({ usuario: resultado.usuario });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno al iniciar sesión' });
    }
}

export async function logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
}

export async function me(req, res) {
    try {
        const user = await buscarPorUsuario(req.usuario.usuario);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        const { password, ...usuario } = user;
        res.json({ usuario });
    } catch (err) { res.status(500).json({ error: 'Error al verificar la sesión' }); }
}
