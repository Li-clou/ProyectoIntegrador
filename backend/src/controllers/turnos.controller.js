import { listarTurnos, abrirTurno, cerrarTurno, turnoAbiertoDeUsuario } from '../models/turnos.model.js';

const TIPOS = ['matutino', 'vespertino', 'nocturno'];

export async function listar(req, res, next) {
    try { res.json(await listarTurnos(req.query)); } catch (err) { next(err); }
}

export async function actual(req, res, next) {
    try { res.json(await turnoAbiertoDeUsuario(req.usuario.id_usuario)); } catch (err) { next(err); }
}

export async function abrir(req, res, next) {
    try {
        const id_usuario = req.usuario.rol === 'admin' && req.body.id_usuario ? req.body.id_usuario : req.usuario.id_usuario;
        if (!TIPOS.includes(req.body.tipo_turno)) return res.status(400).json({ error: 'Turno inválido' });
        if (await turnoAbiertoDeUsuario(id_usuario)) return res.status(409).json({ error: 'El cajero ya tiene un turno abierto' });
        res.status(201).json(await abrirTurno({ id_usuario, tipo_turno: req.body.tipo_turno, monto_inicial: req.body.monto_inicial }));
    } catch (err) { next(err); }
}

export async function cerrar(req, res, next) {
    try {
        const turno = await cerrarTurno(req.params.id, Number(req.body.monto_final || 0));
        if (!turno) return res.status(404).json({ error: 'Turno abierto no encontrado' });
        res.json(turno);
    } catch (err) { next(err); }
}
