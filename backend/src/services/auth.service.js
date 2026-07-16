import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config.js';
import {
    crearUsuario,
    buscarPorUsuario,
    buscarPorGoogleId,
    buscarPorEmail,
    crearUsuarioGoogle
} from "../models/auth.model.js";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function registrarUsuario(datos) {
    const passwordHash = await bcrypt.hash(datos.password, 10);
    const nuevo = await crearUsuario({ ...datos, passwordHash });

    return {
        id_usuario: nuevo.id_usuario,
        nombre_us: datos.nombre_us,
        ap_us: datos.ap_us,
        am_us: datos.am_us,
        usuario: datos.usuario
    };
}

export async function loginUsuario({ usuario, password }) {
    const user = await buscarPorUsuario(usuario);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const token = jwt.sign(
        { id_usuario: user.id_usuario, usuario: user.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        token,
        usuario: {
            id_usuario: user.id_usuario,
            nombre_us: user.nombre_us,
            ap_us: user.ap_us,
            am_us: user.am_us,
            direccion: user.direccion,
            telefono: user.telefono,
            usuario: user.usuario
        }
    };
}

export async function loginConGoogle(idToken) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { sub, email, given_name, family_name, ... }

    let user = await buscarPorGoogleId(payload.sub);

    if (!user) {
        // si ya existe un usuario con ese email (registrado por password), lo enlazamos
        user = await buscarPorEmail(payload.email);
        if (!user) {
            user = await crearUsuarioGoogle({
                nombre_us: payload.given_name || payload.name || 'Usuario',
                ap_us: payload.family_name || '',
                am_us: '',
                usuario: payload.email.split('@')[0],
                email: payload.email,
                google_id: payload.sub,
            });
        }
    }

    const token = jwt.sign(
        { id_usuario: user.id_usuario, usuario: user.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        token,
        usuario: {
            id_usuario: user.id_usuario,
            nombre_us: user.nombre_us,
            ap_us: user.ap_us,
            am_us: user.am_us,
            usuario: user.usuario,
            email: user.email,
        }
    };
}