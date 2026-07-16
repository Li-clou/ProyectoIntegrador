import { registrarUsuario, loginUsuario, loginConGoogle } from "../services/auth.service.js";
import { buscarPorUsuario } from "../models/auth.model.js";

export async function registro(req, res, next) {
    try {
        const { nombre_us, ap_us, am_us, direccion, telefono, usuario, password } = req.body;
        if (!nombre_us || !ap_us || !am_us || !usuario || !password) {
            return res.status(400).json({ error: 'nombre_us, ap_us, am_us, usuario y password son obligatorios' });
        }

        const nuevoUsuario = await registrarUsuario({ nombre_us, ap_us, am_us, direccion, telefono, usuario, password });
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        if (err.code === '23505') { // codigo de duplicado en Postgres (usuario ya existe)
            return res.status(409).json({ error: 'El usuario ya esta registrado' });
        }
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const { usuario, password } = req.body;
        if (!usuario || !password) {
            return res.status(400).json({ error: 'usuario y password son obligatorios' });
        }

        const resultado = await loginUsuario({ usuario, password });
        if (!resultado) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        res.cookie('token', resultado.token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // en produccion con HTTPS esto debe ser true
            maxAge: 60 * 60 * 1000 // 1 hora, igual que el expiresIn del JWT
        });

        res.json({ usuario: resultado.usuario });
    } catch (err) {
        next(err);
    }
}

export async function googleLogin(req, res, next) {
    try {
        const { credential } = req.body; // el idToken que manda el boton de Google
        if (!credential) {
            return res.status(400).json({ error: 'credential es obligatorio' });
        }

        const resultado = await loginConGoogle(credential);

        res.cookie('token', resultado.token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 60 * 60 * 1000
        });

        res.json({ usuario: resultado.usuario });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Token de Google invalido' });
    }
}

export async function logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Sesion cerrada' });
}

// Le dice al frontend "quien soy" segun la cookie. Si el middleware verificarToken
// dejo pasar la request, es porque el token es valido.
export async function me(req, res, next) {
    try {
        const user = await buscarPorUsuario(req.usuario.usuario);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { password, ...usuarioSinPassword } = user;
        res.json({ usuario: usuarioSinPassword });
    } catch (err) {
        next(err);
    }
}