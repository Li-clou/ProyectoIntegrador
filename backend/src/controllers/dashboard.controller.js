import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const ventasRes = await pool.query(`SELECT COALESCE(SUM(total), 0) AS total FROM venta WHERE DATE(fecha_v) = CURRENT_DATE`);
        const ventasDia = parseFloat(ventasRes.rows[0].total);

        const transRes = await pool.query(`SELECT COUNT(id_venta) AS total FROM venta WHERE DATE(fecha_v) = CURRENT_DATE`);
        const transacciones = parseInt(transRes.rows[0].total);

        const cajerosRes = await pool.query(`SELECT COUNT(id_turno) AS total FROM turnos WHERE estado = 'ABIERTO'`);
        const cajerosActivos = parseInt(cajerosRes.rows[0].total);

        const prodRes = await pool.query(`
            SELECT COALESCE(SUM(dv.cantidad), 0) AS total 
            FROM detalle_venta dv JOIN venta v ON dv.id_venta_dv = v.id_venta 
            WHERE DATE(v.fecha_v) = CURRENT_DATE
        `);
        const productosVendidos = parseInt(prodRes.rows[0].total);

        const invRes = await pool.query(`SELECT COUNT(id_producto) AS total FROM productos WHERE existencia <= stock_minimo`);
        const inventarioBajo = parseInt(invRes.rows[0].total);

        res.json({ ventasDia, transacciones, cajerosActivos, productosVendidos, inventarioBajo });
    } catch (error) {
        console.error('Error en getDashboardStats:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

export const getCajerosActivos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id_turno, u.id_usuario, u.nombre_us, u.ap_us, t.fecha_inicio,
                COALESCE(SUM(v.total), 0) AS monto_vendido, COUNT(v.id_venta) AS transacciones
            FROM turnos t
            JOIN usuarios u ON u.id_usuario = t.id_usuario
            LEFT JOIN venta v ON v.id_usuario_v = t.id_usuario AND v.fecha_v >= t.fecha_inicio
            WHERE t.estado = 'ABIERTO'
            GROUP BY t.id_turno, u.id_usuario, u.nombre_us, u.ap_us, t.fecha_inicio
            ORDER BY t.fecha_inicio ASC
        `);
        const cajeros = result.rows.map(row => ({
            id_usuario: row.id_usuario, nombre_us: row.nombre_us, ap_us: row.ap_us,
            fecha_inicio: row.fecha_inicio, montoVendido: parseFloat(row.monto_vendido), transacciones: parseInt(row.transacciones)
        }));
        res.json(cajeros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cajeros' });
    }
};

export const getGraficaVentas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT EXTRACT(HOUR FROM fecha_v) AS hora, SUM(total) AS total_vendido
            FROM venta WHERE DATE(fecha_v) = CURRENT_DATE GROUP BY hora ORDER BY hora ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error grafica' });
    }
};

export const getInventarioBajoDetalle = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id_producto, 
                   p.nombre_producto AS nombre_p, 
                   p.existencia, 
                   p.stock_minimo, 
                   m.nombre_marca AS marca
            FROM productos p 
            LEFT JOIN marcas m ON p.id_marca_producto = m.id_marca
            WHERE p.existencia <= p.stock_minimo 
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getInventarioBajoDetalle:', error);
        res.status(500).json({ error: 'Error al obtener inventario bajo' });
    }
};

export const getCambiosTurno = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id_turno, u.nombre_us, u.ap_us, t.fecha_inicio, t.fecha_fin, t.estado
            FROM turnos t JOIN usuarios u ON t.id_usuario = u.id_usuario
            ORDER BY t.fecha_inicio DESC LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error turnos' });
    }
};

export const getVentasRecientes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.id_venta, v.fecha_v, v.total, u.nombre_us, u.ap_us
            FROM venta v
            LEFT JOIN usuarios u ON v.id_usuario_v = u.id_usuario
            ORDER BY v.fecha_v DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getVentasRecientes:', error);
        res.status(500).json({ error: 'Error al obtener ventas recientes' });
    }
};