import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Ventas del día (Suma del total de ventas con fecha de hoy)
        const ventasRes = await pool.query(`
            SELECT COALESCE(SUM(total), 0) AS total 
            FROM venta WHERE DATE(fecha_v) = CURRENT_DATE
        `);
        const ventasDia = parseFloat(ventasRes.rows[0].total);

        // 2. Transacciones (Conteo de tickets de hoy)
        const transRes = await pool.query(`
            SELECT COUNT(id_venta) AS total 
            FROM venta WHERE DATE(fecha_v) = CURRENT_DATE
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
            WHERE DATE(v.fecha_v) = CURRENT_DATE
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