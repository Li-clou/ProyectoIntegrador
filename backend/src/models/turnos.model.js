import pool from '../config/db.js';

export async function listarTurnos({ estado } = {}) {
    const resultado = await pool.query(
        `SELECT t.*, u.nombre_us, u.ap_us, u.usuario
         FROM turnos t JOIN usuarios u ON u.id_usuario = t.id_usuario
         WHERE ($1::text IS NULL OR t.estado = $1)
         ORDER BY t.fecha_inicio DESC LIMIT 500`, [estado || null]
    );
    return resultado.rows;
}

export async function abrirTurno({ id_usuario, tipo_turno, monto_inicial = 0 }) {
    const resultado = await pool.query(
        `INSERT INTO turnos (id_usuario, tipo_turno, fecha_inicio, monto_inicial, estado)
         VALUES ($1, $2, NOW(), $3, 'ABIERTO') RETURNING *`,
        [id_usuario, tipo_turno, monto_inicial]
    );
    return resultado.rows[0];
}

export async function cerrarTurno(id_turno, monto_final) {
    const resultado = await pool.query(
        `UPDATE turnos SET fecha_fin = NOW(), monto_final = $2, estado = 'CERRADO'
         WHERE id_turno = $1 AND estado = 'ABIERTO' RETURNING *`, [id_turno, monto_final]
    );
    return resultado.rows[0] || null;
}

export async function turnoAbiertoDeUsuario(id_usuario) {
    const resultado = await pool.query(
        `SELECT * FROM turnos WHERE id_usuario = $1 AND estado = 'ABIERTO' ORDER BY fecha_inicio DESC LIMIT 1`,
        [id_usuario]
    );
    return resultado.rows[0] || null;
}
