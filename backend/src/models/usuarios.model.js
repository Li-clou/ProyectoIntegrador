import pool from "../config/db.js";

export async function listarUsuarios() {
    const resultado = await pool.query(
        `SELECT id_usuario, nombre_us, ap_us, am_us, direccion, telefono, usuario, email, rol
         FROM usuarios ORDER BY nombre_us ASC`
    );
    return resultado.rows;
}

export async function obtenerUsuarioPorId(id_usuario) {
    const resultado = await pool.query(
        `SELECT id_usuario, nombre_us, ap_us, am_us, direccion, telefono, usuario, email, rol
         FROM usuarios WHERE id_usuario = $1`,
        [id_usuario]
    );
    return resultado.rows[0] || null;
}

export async function actualizarUsuario(id_usuario, campos) {
    const sets = [];
    const valores = [];

    for (const [clave, valor] of Object.entries(campos)) {
        valores.push(valor);
        sets.push(`${clave} = $${valores.length}`);
    }
    if (!sets.length) return null;

    valores.push(id_usuario);
    const resultado = await pool.query(
        `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = $${valores.length}
         RETURNING id_usuario, nombre_us, ap_us, am_us, direccion, telefono, usuario, email, rol`,
        valores
    );
    return resultado.rows[0] || null;
}

export async function eliminarUsuario(id_usuario) {
    const resultado = await pool.query(
        `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario`,
        [id_usuario]
    );
    return resultado.rows[0] || null;
}
