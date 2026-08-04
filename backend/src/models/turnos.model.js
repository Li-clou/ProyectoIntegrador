import pool from "../config/db.js";

export async function buscarTurnoAbierto(id_usuario) {
    const resultado = await pool.query(
        `SELECT * FROM turnos WHERE id_usuario = $1 AND estado = 'ABIERTO'`,
        [id_usuario]
    );
    return resultado.rows[0] || null;
}

export async function crearTurno(id_usuario) {
    const resultado = await pool.query(
        `INSERT INTO turnos (id_usuario, fecha_inicio, monto_inicial, estado)
         VALUES ($1, NOW(), 0.00, 'ABIERTO') RETURNING *`,
        [id_usuario]
    );
    return resultado.rows[0];
}

// Calcula lo vendido durante ese turno específico, sumando las ventas
// del cajero desde que abrió hasta ahora.
export async function calcularResumenTurno(id_turno) {
    const resultado = await pool.query(
        `SELECT 
            COALESCE(SUM(v.total), 0) AS total_vendido,
            COUNT(v.id_venta) AS transacciones
         FROM turnos t
         LEFT JOIN venta v 
            ON v.id_usuario_v = t.id_usuario 
            AND v.fecha_v >= t.fecha_inicio
         WHERE t.id_turno = $1
         GROUP BY t.id_turno`,
        [id_turno]
    );
    return resultado.rows[0] || { total_vendido: 0, transacciones: 0 };
}

export async function cerrarTurno(id_turno, monto_final, total_vendido) {
    const resultado = await pool.query(
        `UPDATE turnos 
         SET estado = 'CERRADO', fecha_fin = NOW(), monto_final = $1, total_vendido = $2
         WHERE id_turno = $3 AND estado = 'ABIERTO'
         RETURNING *`,
        [monto_final, total_vendido, id_turno]
    );
    return resultado.rows[0] || null;
}

export async function listarHistorialTurnos(id_usuario) {
    const resultado = await pool.query(
        `SELECT * FROM turnos WHERE id_usuario = $1 ORDER BY fecha_inicio DESC LIMIT 20`,
        [id_usuario]
    );
    return resultado.rows;
}