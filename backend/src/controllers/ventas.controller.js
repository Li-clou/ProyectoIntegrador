import { registrarVenta, obtenerVenta, obtenerListaVentas, emitirTicket } from "../services/ventas.service.js";

export async function crear(req, res, next) {
    // ... (sin cambios, igual que ya lo tienes)
    try {
        const {
            id_cliente_v, tipo_venta,
            numero_mesa, metodo_pago, propina, descuento, monto_recibido, items,
        } = req.body;

        const id_usuario_v = req.usuario.id_usuario;

        if (!metodo_pago || !Array.isArray(items) || !items.length) {
            return res.status(400).json({
                error: 'metodo_pago e items (con al menos 1 producto) son obligatorios',
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

        res.status(201).json(resultado.venta);
    } catch (err) {
        next(err);
    }
}

// NUEVO: listado según rol
export async function listar(req, res, next) {
    try {
        const { fecha_inicio, fecha_fin, id_usuario } = req.query;
        const filtros = { fecha_inicio, fecha_fin };

        if (req.usuario.rol === 'admin') {
            // El admin puede filtrar por un cajero en particular si lo pide
            if (id_usuario) filtros.id_usuario = id_usuario;
        } else {
            // Un cajero SIEMPRE ve solo lo suyo, sin importar qué mande en la query
            filtros.id_usuario = req.usuario.id_usuario;
        }

        const ventas = await obtenerListaVentas(filtros);
        res.json(ventas);
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
        if (req.usuario.rol !== 'admin' && venta.id_usuario_v !== req.usuario.id_usuario) {
            return res.status(403).json({ error: 'No tienes permiso para ver esta venta' });
        }
        res.json(venta);
    } catch (err) {
        next(err);
    }
}

export async function ticket(req, res, next) {
    try {
        const venta = await obtenerVenta(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        if (req.usuario.rol !== 'admin' && venta.id_usuario_v !== req.usuario.id_usuario) {
            return res.status(403).json({ error: 'No tienes permiso para generar este ticket' });
        }

        const { email } = req.body;
        const resultado = await emitirTicket(req.params.id, email);

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
