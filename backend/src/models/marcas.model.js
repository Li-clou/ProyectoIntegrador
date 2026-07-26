import pool from "../config/db.js";

export async function listarMarcas() {
    const resultado = await pool.query(
        `SELECT * FROM marcas ORDER BY nombre_marca ASC`
    );
    return resultado.rows;
}

export async function obtenerMarcaPorId(id_marca) {
    const resultado = await pool.query(
        `SELECT * FROM marcas WHERE id_marca = $1`,
        [id_marca]
    );
    return resultado.rows[0] || null;
}

export async function crearMarca({ nombre_marca }) {
    const resultado = await pool.query(
        `INSERT INTO marcas (nombre_marca) VALUES ($1) RETURNING *`,
        [nombre_marca]
    );
    return resultado.rows[0];
}

export async function actualizarMarca(id_marca, { nombre_marca }) {
    const resultado = await pool.query(
        `UPDATE marcas SET nombre_marca = $1 WHERE id_marca = $2 RETURNING *`,
        [nombre_marca, id_marca]
    );
    return resultado.rows[0] || null;
}

export async function eliminarMarca(id_marca) {
    const resultado = await pool.query(
        `DELETE FROM marcas WHERE id_marca = $1 RETURNING id_marca`,
        [id_marca]
    );
    return resultado.rows[0] || null;
}
