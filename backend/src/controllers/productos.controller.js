import {
    obtenerListaProductos,
    obtenerProducto,
    registrarProducto,
    editarProducto,
    borrarProducto,
    moverStock,
} from "../services/productos.service.js";

export async function listar(req, res, next) {
    try {
        const { buscar, id_marca } = req.query;
        const productos = await obtenerListaProductos({ buscar, id_marca });
        res.json(productos);
    } catch (err) {
        next(err);
    }
}

export async function obtener(req, res, next) {
    try {
        const producto = await obtenerProducto(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (err) {
        next(err);
    }
}

export async function crear(req, res, next) {
    try {
        const { codigo, nombre_producto, precio_venta } = req.body;
        if (!codigo || !nombre_producto || !precio_venta) {
            return res.status(400).json({
                error: 'codigo, nombre_producto y precio_venta son obligatorios',
            });
        }

        const nuevoProducto = await registrarProducto(req.body);
        res.status(201).json(nuevoProducto);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un producto con ese código' });
        }
        next(err);
    }
}

export async function actualizar(req, res, next) {
    try {
        const camposPermitidos = [
            'codigo', 'nombre_producto', 'id_marca_producto',
            'precio_compra', 'precio_venta', 'existencia', 'stock_minimo',
            'iva', 'foto', 'id_proveedor',
        ];
        const campos = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) campos[campo] = req.body[campo];
        }
        if (!Object.keys(campos).length) {
            return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
        }

        const producto = await editarProducto(req.params.id, campos);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (err) {
        next(err);
    }
}

export async function eliminar(req, res, next) {
    try {
        const eliminado = await borrarProducto(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado', id_producto: eliminado.id_producto });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar: el producto tiene ventas o compras asociadas',
            });
        }
        next(err);
    }
}

export async function ajustarExistencia(req, res, next) {
    try {
        const { cantidad, tipo } = req.body;
        if (!cantidad || !['entrada', 'salida'].includes(tipo)) {
            return res.status(400).json({
                error: 'Se requiere "cantidad" (number) y "tipo" ("entrada" o "salida")',
            });
        }

        const resultado = await moverStock(req.params.id, cantidad, tipo);
        if (resultado.error === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        if (resultado.error === 'STOCK_INSUFICIENTE') {
            return res.status(400).json({ error: 'Stock insuficiente para esa salida' });
        }

        res.json(resultado.producto);
    } catch (err) {
        next(err);
    }
}