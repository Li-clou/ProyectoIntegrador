import pool from "../config/db.js";

export async function listarProductos({ buscar, id_marca } = {}) {
    const condiciones = [];
    const valores = [];

    let sql = `
        SELECT p.*, m.nombre_marca
        FROM productos p
        LEFT JOIN marcas m ON m.id_marca = p.id_marca_producto
    `;

    if (buscar) {
        valores.push(`%${buscar}%`);
        condiciones.push(`(p.nombre_producto ILIKE $${valores.length} OR p.codigo ILIKE $${valores.length})`);
    }
    if (id_marca) {
        valores.push(id_marca);
        condiciones.push(`p.id_marca_producto = $${valores.length}`);
    }
    if (condiciones.length) {
        sql += ' WHERE ' + condiciones.join(' AND ');
    }
    sql += ' ORDER BY p.nombre_producto ASC';

    const resultado = await pool.query(sql, valores);
    return resultado.rows;
}

export async function obtenerProductoPorId(id_producto) {
    const resultado = await pool.query(
        `SELECT p.*, m.nombre_marca
         FROM productos p
         LEFT JOIN marcas m ON m.id_marca = p.id_marca_producto
         WHERE p.id_producto = $1`,
        [id_producto]
    );
    return resultado.rows[0] || null;
}

export async function crearProducto(datos) {
    const {
        codigo,
        nombre_producto,
        id_marca_producto,
        precio_compra,
        precio_venta,
        existencia,
        stock_minimo,
        iva,
        foto,
        id_proveedor,
    } = datos;

    const resultado = await pool.query(
        `INSERT INTO productos
            (codigo, nombre_producto, id_marca_producto, precio_compra,
             precio_venta, existencia, stock_minimo, iva, foto, id_proveedor)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [
            codigo,
            nombre_producto,
            id_marca_producto || null,
            precio_compra || null,
            precio_venta,
            existencia ?? 0,
            stock_minimo ?? 10,
            iva || null,
            foto || null,
            id_proveedor || null,
        ]
    );
    return resultado.rows[0];
}

export async function actualizarProducto(id_producto, campos) {
    const sets = [];
    const valores = [];

    for (const [clave, valor] of Object.entries(campos)) {
        valores.push(valor);
        sets.push(`${clave} = $${valores.length}`);
    }
    if (!sets.length) return null;

    valores.push(id_producto);
    const resultado = await pool.query(
        `UPDATE productos SET ${sets.join(', ')} WHERE id_producto = $${valores.length} RETURNING *`,
        valores
    );
    return resultado.rows[0] || null;
}

export async function eliminarProducto(id_producto) {
    const resultado = await pool.query(
        `DELETE FROM productos WHERE id_producto = $1 RETURNING id_producto`,
        [id_producto]
    );
    return resultado.rows[0] || null;
}

// Ajusta existencia con bloqueo de fila (FOR UPDATE) para evitar condiciones
// de carrera cuando dos ventas descuentan el mismo producto al mismo tiempo.
export async function ajustarStock(id_producto, cantidad, tipo) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const actual = await client.query(
            `SELECT existencia FROM productos WHERE id_producto = $1 FOR UPDATE`,
            [id_producto]
        );
        if (!actual.rows.length) {
            await client.query('ROLLBACK');
            return { error: 'NOT_FOUND' };
        }
        if (tipo === 'salida' && actual.rows[0].existencia < cantidad) {
            await client.query('ROLLBACK');
            return { error: 'STOCK_INSUFICIENTE' };
        }

        const operador = tipo === 'entrada' ? '+' : '-';
        const resultado = await client.query(
            `UPDATE productos SET existencia = existencia ${operador} $1
             WHERE id_producto = $2 RETURNING *`,
            [cantidad, id_producto]
        );

        await client.query('COMMIT');
        return { producto: resultado.rows[0] };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function marcarAlertaEnviada(id_producto, valor) {
    await pool.query(
        `UPDATE productos SET alerta_enviada = $1 WHERE id_producto = $2`,
        [valor, id_producto]
    );
}