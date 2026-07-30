import { registrarUsuario, loginUsuario, loginConGoogle } from "../services/auth.service.js";
import { buscarPorUsuario } from "../models/auth.model.js";
import pool from "../config/db.js"; // Importación de la conexión a PostgreSQL

export async function registro(req, res) {
    try {
        const { nombre_us, ap_us, am_us, direccion, telefono, usuario, password } = req.body;
        if (!nombre_us || !ap_us || !am_us || !usuario || !password) {
            return res.status(400).json({ error: 'nombre_us, ap_us, am_us, usuario y password son obligatorios' });
        }

        const nuevoUsuario = await registrarUsuario({ nombre_us, ap_us, am_us, direccion, telefono, usuario, password });
        return res.status(201).json(nuevoUsuario);
    } catch (err) {
        if (err.code === '23505') { // código de duplicado en Postgres (usuario ya existe)
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }
        console.error('Error en registro:', err);
        return res.status(500).json({ error: 'Ocurrió un error en el servidor al intentar registrar.' });
    }
}

export async function login(req, res) {
    try {
        const { usuario, password } = req.body;
        if (!usuario || !password) {
            return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios.' });
        }

        // 1. Validamos credenciales usando tu servicio actual
        const resultado = await loginUsuario({ usuario, password });
        
        if (!resultado) {
            return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' });
        }

        // ==========================================
        // 2. LÓGICA DE TURNOS (SOLO PARA CAJEROS)
        // ==========================================
        const user = resultado.usuario; // Extraemos la info del usuario devuelta por tu servicio

        if (user && user.rol === 'cajero') {
            // Verificamos si ya tiene un turno abierto
            const queryTurnoAbierto = "SELECT * FROM turnos WHERE id_usuario = $1 AND estado = 'ABIERTO'";
            const turnoRes = await pool.query(queryTurnoAbierto, [user.id_usuario]);

            if (turnoRes.rows.length === 0) {
                // Si no tiene turno, creamos uno nuevo con la hora exacta
                const queryNuevoTurno = `
                    INSERT INTO turnos (id_usuario, fecha_inicio, monto_inicial, estado) 
                    VALUES ($1, NOW(), 0.00, 'ABIERTO')
                `;
                await pool.query(queryNuevoTurno, [user.id_usuario]);
                console.log(`Nuevo turno abierto para el cajero: ${user.usuario}`);
            } else {
                console.log(`El cajero ${user.usuario} retomó su turno abierto.`);
            }
        }
        // ==========================================

        // 3. Generamos la cookie con el token
        res.cookie('token', resultado.token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // en producción con HTTPS esto debe ser true
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        // 4. Devolvemos la info del usuario al frontend (incluyendo su rol)
        return res.json({ usuario: resultado.usuario });
    } catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión.' });
    }
}

export async function logout(req, res) {
    res.clearCookie('token');
    return res.json({ message: 'Sesión cerrada exitosamente.' });
}

export async function me(req, res) {
    try {
        const user = await buscarPorUsuario(req.usuario.usuario);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const { password, ...usuarioSinPassword } = user;
        return res.json({ usuario: usuarioSinPassword });
    } catch (err) {
        console.error('Error en me:', err);
        return res.status(500).json({ error: 'Error interno al verificar la sesión activa.' });
    }
}

export async function googleLogin(req, res) {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Falta el credential de Google.' });
        }

        const resultado = await loginConGoogle(credential);

        res.cookie('token', resultado.token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 60 * 60 * 1000
        });

        return res.json({ usuario: resultado.usuario });
    } catch (err) {
        console.error('Error en googleLogin:', err);
        return res.status(401).json({ error: 'Token de Google inválido.' });
    }
}