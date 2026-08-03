import { registrarVenta, obtenerVenta, obtenerVentas, emitirTicket, cancelarVenta } from "../services/ventas.service.js";

export async function crear(req, res, next) {
    try {
        const {
            id_cliente_v, tipo_venta, numero_mesa, metodo_pago, propina,
            descuento, monto_recibido, email_ticket, items,
        } = req.body;

        if (!['efectivo', 'tarjeta'].includes(metodo_pago) || !Array.isArray(items) || !items.length) {
            return res.status(400).json({
                error: 'El método de pago debe ser efectivo o tarjeta y debe haber productos',
            });
        }

        const resultado = await registrarVenta({
            id_cliente_v, id_usuario_v: req.usuario.id_usuario, tipo_venta, numero_mesa,
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

        // Cada venta genera su PDF; cuando se proporciona Gmail también se envía.
        let ticketEnviado = false;
        let ticketError = null;
        try {
            await emitirTicket(resultado.venta.id_venta, email_ticket || null);
            ticketEnviado = Boolean(email_ticket);
        } catch (err) {
            ticketError = 'La venta se registró, pero no se pudo enviar el ticket por correo';
            console.error('Error de ticket:', err.message);
        }
        res.status(201).json({ ...resultado.venta, ticket_enviado: ticketEnviado, ticket_error: ticketError });
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

export async function listar(req, res, next) {
    try {
        res.json(await obtenerVentas(req.query));
    } catch (err) { next(err); }
}

export async function cancelar(req, res, next) {
    try {
        const resultado = await cancelarVenta(req.params.id, req.usuario);
        if (resultado?.error === 'NOT_FOUND') return res.status(404).json({ error: 'Venta no encontrada' });
        if (resultado?.error === 'CANCELADA') return res.status(409).json({ error: 'La venta ya está cancelada' });
        res.json(resultado);
    } catch (err) { next(err); }
}
