import { registrarVenta, obtenerVenta, emitirTicket } from "../services/ventas.service.js";

export async function crear(req, res, next) {
    try {
        const {
            id_cliente_v, id_usuario_v, tipo_venta,
            numero_mesa, metodo_pago, propina, descuento, monto_recibido, items,
        } = req.body;

        if (!id_usuario_v || !metodo_pago || !Array.isArray(items) || !items.length) {
            return res.status(400).json({
                error: 'id_usuario_v, metodo_pago e items (con al menos 1 producto) son obligatorios',
            });
        }

        const resultado = await registrarVenta({
            id_cliente_v, id_usuario_v, tipo_venta, numero_mesa,
            metodo_pago, propina, descuento, monto_recibido, items,
        });

        if (resultado.error === 'STOCK_INSUFICIENTE') {
            return res.status(400).json({
                error: `Stock insuficiente para el producto ${resultado.id_producto}`,
            });
        }
        if (resultado.error === 'PRODUCTO_NO_ENCONTRADO') {
            return res.status(404).json({
                error: `Producto no encontrado: ${resultado.id_producto}`,
            });
        }
        if (resultado.error === 'MONTO_INSUFICIENTE') {
            return res.status(400).json({
                error: `El monto recibido es menor al total a pagar ($${resultado.total})`,
            });
        }

        res.status(201).json(resultado.venta);
    } catch (err) {
        next(err);
    }
}

export async function obtener(req, res, next) {
    try {
        const venta = await obtenerVenta(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (err) {
        next(err);
    }
}

// Genera el ticket en PDF bajo demanda. Si el body trae "email",
// también lo manda por correo. Siempre regresa el PDF en la respuesta.
export async function ticket(req, res, next) {
    try {
        const { email } = req.body;
        const resultado = await emitirTicket(req.params.id, email);

        if (resultado.error === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="ticket-${req.params.id}.pdf"`);
        res.send(resultado.pdfBuffer);
    } catch (err) {
        next(err);
    }
}