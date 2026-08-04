import { obtenerMiTurnoActivo, cerrarTurnoCajero, obtenerHistorial } from "../services/turnos.service.js";

export async function miTurno(req, res) {
    try {
        const turno = await obtenerMiTurnoActivo(req.usuario.id_usuario);
        res.json(turno); // null si no tiene turno abierto
    } catch (err) {
        console.error('Error en miTurno:', err);
        res.status(500).json({ error: 'Error al consultar el turno activo' });
    }
}

export async function cerrar(req, res) {
    try {
        const { monto_final } = req.body;
        if (monto_final === undefined || monto_final === null || isNaN(monto_final)) {
            return res.status(400).json({ error: 'monto_final es obligatorio y debe ser numérico' });
        }

        const resultado = await cerrarTurnoCajero(req.usuario.id_usuario, monto_final);
        if (resultado.error === 'SIN_TURNO_ABIERTO') {
            return res.status(400).json({ error: 'No tienes un turno abierto para cerrar' });
        }

        res.json(resultado);
    } catch (err) {
        console.error('Error en cerrar turno:', err);
        res.status(500).json({ error: 'Error al cerrar el turno' });
    }
}

export async function historial(req, res) {
    try {
        const turnos = await obtenerHistorial(req.usuario.id_usuario);
        res.json(turnos);
    } catch (err) {
        console.error('Error en historial:', err);
        res.status(500).json({ error: 'Error al obtener el historial de turnos' });
    }
}