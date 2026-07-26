import {
    obtenerListaProveedores,
    obtenerProveedor,
    registrarProveedor,
    editarProveedor,
    borrarProveedor,
} from "../services/proveedor.service.js";

export async function listar(req, res, next) {
    try {
        const proveedores = await obtenerListaProveedores();
        res.json(proveedores);
    } catch (err) {
        next(err);
    }
}

export async function obtener(req, res, next) {
    try {
        const proveedor = await obtenerProveedor(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(proveedor);
    } catch (err) {
        next(err);
    }
}

export async function crear(req, res, next) {
    try {
        const { nombre_pv } = req.body;
        if (!nombre_pv) {
            return res.status(400).json({ error: 'nombre_pv es obligatorio' });
        }

        const nuevoProveedor = await registrarProveedor(req.body);
        res.status(201).json(nuevoProveedor);
    } catch (err) {
        next(err);
    }
}

export async function actualizar(req, res, next) {
    try {
        const camposPermitidos = ['nombre_pv', 'direccion_pv', 'telefono_pv'];
        const campos = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) campos[campo] = req.body[campo];
        }
        if (!Object.keys(campos).length) {
            return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
        }

        const proveedor = await editarProveedor(req.params.id, campos);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(proveedor);
    } catch (err) {
        next(err);
    }
}

export async function eliminar(req, res, next) {
    try {
        const eliminado = await borrarProveedor(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ mensaje: 'Proveedor eliminado', id_proveedor: eliminado.id_proveedor });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar: hay productos que usan este proveedor',
            });
        }
        next(err);
    }
}
