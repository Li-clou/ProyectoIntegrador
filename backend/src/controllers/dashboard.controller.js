import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Ventas del día (Suma del total de ventas con fecha de hoy)
        const ventasRes = await pool.query(`
            SELECT COALESCE(SUM(total), 0) AS total 
            FROM venta WHERE DATE(fecha_v) = CURRENT_DATE AND COALESCE(estado, 'COMPLETADA') <> 'CANCELADA'
        `);
        const ventasDia = parseFloat(ventasRes.rows[0].total);

        // 2. Transacciones (Conteo de tickets de hoy)
        const transRes = await pool.query(`
            SELECT COUNT(id_venta) AS total 
            FROM venta WHERE DATE(fecha_v) = CURRENT_DATE AND COALESCE(estado, 'COMPLETADA') <> 'CANCELADA'
        `);
        const transacciones = parseInt(transRes.rows[0].total);

        // 3. Cajeros Activos (Conteo de turnos abiertos)
        const cajerosRes = await pool.query(`
            SELECT COUNT(id_turno) AS total 
            FROM turnos WHERE estado = 'ABIERTO'
        `);
        const cajerosActivos = parseInt(cajerosRes.rows[0].total);

        // 4. Productos Vendidos (Suma de las cantidades en el detalle de venta de hoy)
        const prodRes = await pool.query(`
            SELECT COALESCE(SUM(dv.cantidad), 0) AS total 
            FROM detalle_venta dv 
            JOIN venta v ON dv.id_venta_dv = v.id_venta 
            WHERE DATE(v.fecha_v) = CURRENT_DATE AND COALESCE(v.estado, 'COMPLETADA') <> 'CANCELADA'
        `);
        const productosVendidos = parseInt(prodRes.rows[0].total);

        // 5. Inventario Bajo
        const invRes = await pool.query(`
            SELECT COUNT(id_producto) AS total 
            FROM productos WHERE existencia <= stock_minimo
        `);
        const inventarioBajo = parseInt(invRes.rows[0].total);

        // Devolvemos el JSON al Frontend
        res.json({
            ventasDia,
            transacciones,
            cajerosActivos,
            productosVendidos,
            inventarioBajo
        });
    } catch (error) {
        console.error('Error en getDashboardStats:', error);
        res.status(500).json({ error: 'Error interno al obtener estadísticas' });
    }

    
};

export const getCajerosActivos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.id_turno,
                u.id_usuario,
                u.nombre_us,
                u.ap_us,
                t.fecha_inicio,
                COALESCE(SUM(v.total), 0) AS monto_vendido,
                COUNT(v.id_venta) AS transacciones
            FROM turnos t
            JOIN usuarios u ON u.id_usuario = t.id_usuario
            LEFT JOIN venta v 
                ON v.id_usuario_v = t.id_usuario 
                AND v.fecha_v >= t.fecha_inicio
            WHERE t.estado = 'ABIERTO'
            GROUP BY t.id_turno, u.id_usuario, u.nombre_us, u.ap_us, t.fecha_inicio
            ORDER BY t.fecha_inicio ASC
        `);

        const cajeros = result.rows.map(row => ({
            id_usuario: row.id_usuario,
            nombre_us: row.nombre_us,
            ap_us: row.ap_us,
            fecha_inicio: row.fecha_inicio,
            montoVendido: parseFloat(row.monto_vendido),
            transacciones: parseInt(row.transacciones)
        }));

        res.json(cajeros);
    } catch (error) {
        console.error('Error en getCajerosActivos:', error);
        res.status(500).json({ error: 'Error interno al obtener cajeros activos' });
    }
};