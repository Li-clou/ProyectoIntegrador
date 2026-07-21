import pool from "../config/db.js";

// Registra la venta completa en una sola transacción:
// 1. Bloquea y valida cada producto (precio real + stock disponible)
// 2. Calcula subtotal, IVA y total en el servidor (nunca confiamos en
//    precios que mande el frontend)
// 3. Inserta venta y cada detalle_venta
// 4. Descuenta existencia
export async function crearVenta({
    id_cliente_v,
    id_usuario_v,
    tipo_venta,
    numero_mesa,
    metodo_pago,
    propina,
    descuento,
    monto_recibido,
    items, // [{ id_producto_dv, cantidad }, ...]
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let subtotal = 0;
        let ivaTotal = 0;
        const detalles = [];

        for (const item of items) {
            const { rows } = await client.query(
                `SELECT precio_venta, iva, existencia
                 FROM productos WHERE id_producto = $1 FOR UPDATE`,
                [item.id_producto_dv]
            );
            if (!rows.length) {
                await client.query('ROLLBACK');
                return { error: 'PRODUCTO_NO_ENCONTRADO', id_producto: item.id_producto_dv };
            }
            const producto = rows[0];
            if (producto.existencia < item.cantidad) {
                await client.query('ROLLBACK');
                return { error: 'STOCK_INSUFICIENTE', id_producto: item.id_producto_dv };
            }

            const importe = Number(producto.precio_venta) * item.cantidad;
            const ivaImporte = importe * (Number(producto.iva || 0) / 100);
            subtotal += importe;
            ivaTotal += ivaImporte;

            detalles.push({
                id_producto_dv: item.id_producto_dv,
                cantidad: item.cantidad,
                precio_s_dv: producto.precio_venta,
            });
        }

        const descuentoAplicado = Number(descuento || 0);
        const total = subtotal - descuentoAplicado + ivaTotal + Number(propina || 0);

        // El cambio solo aplica y se calcula si es pago en efectivo y
        // mandaron cuánto entregó el cliente.
        let cambio = null;
        if (metodo_pago === 'efectivo' && monto_recibido !== undefined && monto_recibido !== null) {
            if (Number(monto_recibido) < total) {
                await client.query('ROLLBACK');
                return { error: 'MONTO_INSUFICIENTE', total };
            }
            cambio = Number(monto_recibido) - total;
        }

        const ventaResult = await client.query(
            `INSERT INTO venta
                (id_cliente_v, fecha_v, id_usuario_v, subtotal, iva_total,
                 propina, descuento, total, metodo_pago, tipo_venta,
                 numero_mesa, monto_recibido, cambio)
             VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                id_cliente_v || null,
                id_usuario_v,
                subtotal,
                ivaTotal,
                propina || 0,
                descuentoAplicado,
                total,
                metodo_pago,
                tipo_venta || 'mesa',
                numero_mesa || null,
                monto_recibido || null,
                cambio,
            ]
        );
        const venta = ventaResult.rows[0];

        for (const detalle of detalles) {
            await client.query(
                `INSERT INTO detalle_venta (id_venta_dv, id_producto_dv, cantidad, precio_s_dv)
                 VALUES ($1, $2, $3, $4)`,
                [venta.id_venta, detalle.id_producto_dv, detalle.cantidad, detalle.precio_s_dv]
            );
            await client.query(
                `UPDATE productos SET existencia = existencia - $1 WHERE id_producto = $2`,
                [detalle.cantidad, detalle.id_producto_dv]
            );
        }

        await client.query('COMMIT');
        return { venta };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Trae la venta con todo lo necesario para armar el ticket:
// datos del cliente, del cajero, y cada producto vendido con su cantidad.
export async function obtenerVentaCompleta(id_venta) {
    const ventaResult = await pool.query(
        `SELECT v.*, c.nombre_cliente, u.nombre_us, u.ap_us
         FROM venta v
         LEFT JOIN cliente c ON c.id_cliente = v.id_cliente_v
         LEFT JOIN usuarios u ON u.id_usuario = v.id_usuario_v
         WHERE v.id_venta = $1`,
        [id_venta]
    );
    if (!ventaResult.rows.length) return null;

    const itemsResult = await pool.query(
        `SELECT dv.*, p.nombre_producto
         FROM detalle_venta dv
         JOIN productos p ON p.id_producto = dv.id_producto_dv
         WHERE dv.id_venta_dv = $1`,
        [id_venta]
    );

    return { ...ventaResult.rows[0], items: itemsResult.rows };
}
