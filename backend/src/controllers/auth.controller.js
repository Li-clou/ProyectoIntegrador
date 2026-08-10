import { registrarUsuario, loginUsuario, loginConGoogle } from "../services/auth.service.js";
import { buscarPorUsuario } from "../models/auth.model.js";
import { buscarTurnoAbierto, crearTurno } from "../models/turnos.model.js";

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
        if (!usuario || !password) return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        const resultado = await loginUsuario({ usuario, password });

        if (!resultado) {
            return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' });
        }

        // ==========================================
        // 2. LÓGICA DE TURNOS (SOLO PARA CAJEROS)
        // ==========================================
        const user = resultado.usuario;
        if (!user.rol) {
            return res.status(500).json({ error: 'El usuario no tiene un rol asignado. Contacta al administrador.' });
        }

        if (user.rol === 'cajero') {
            const turnoAbierto = await buscarTurnoAbierto(user.id_usuario);

            if (!turnoAbierto) {
                await crearTurno(user.id_usuario);
                console.log(`Nuevo turno abierto para el cajero: ${user.usuario}`);
            } else {
                console.log(`El cajero ${user.usuario} retomó su turno abierto.`);
            }
        }
        // ==========================================

        // 3. Ya NO ponemos cookie. Cada microservicio vive en un subdominio
        // distinto de Railway y las cookies no cruzan entre subdominios.
        // Mandamos el token directo en el JSON; el frontend lo guarda y lo
        // manda como header Authorization en cada request.
        res.json({ usuario: resultado.usuario, token: resultado.token });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno al iniciar sesión' });
    }
}

export async function logout(req, res) {
    // Ya no hay cookie de servidor que limpiar. El frontend simplemente
    // borra el token que tenía guardado (localStorage/signal/lo que uses).
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