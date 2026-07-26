import pool from "../config/db.js";

export async function listarProveedores() {
    const resultado = await pool.query(
        `SELECT * FROM proveedor ORDER BY nombre_pv ASC`
    );
    return resultado.rows;
}

export async function obtenerProveedorPorId(id_proveedor) {
    const resultado = await pool.query(
        `SELECT * FROM proveedor WHERE id_proveedor = $1`,
        [id_proveedor]
    );
    return resultado.rows[0] || null;
}

export async function crearProveedor({ nombre_pv, direccion_pv, telefono_pv }) {
    const resultado = await pool.query(
        `INSERT INTO proveedor (nombre_pv, direccion_pv, telefono_pv)
         VALUES ($1, $2, $3) RETURNING *`,
        [nombre_pv, direccion_pv || null, telefono_pv || null]
    );
    return resultado.rows[0];
}

export async function actualizarProveedor(id_proveedor, campos) {
    const sets = [];
    const valores = [];

    for (const [clave, valor] of Object.entries(campos)) {
        valores.push(valor);
        sets.push(`${clave} = $${valores.length}`);
    }
    if (!sets.length) return null;

    valores.push(id_proveedor);
    const resultado = await pool.query(
        `UPDATE proveedor SET ${sets.join(', ')} WHERE id_proveedor = $${valores.length} RETURNING *`,
        valores
    );
    return resultado.rows[0] || null;
}

export async function eliminarProveedor(id_proveedor) {
    const resultado = await pool.query(
        `DELETE FROM proveedor WHERE id_proveedor = $1 RETURNING id_proveedor`,
        [id_proveedor]
    );
    return resultado.rows[0] || null;
}
