import {
    obtenerListaMarcas,
    obtenerMarca,
    registrarMarca,
    editarMarca,
    borrarMarca,
} from "../services/marcas.service.js";

export async function listar(req, res, next) {
    try {
        const marcas = await obtenerListaMarcas();
        res.json(marcas);
    } catch (err) {
        next(err);
    }
}

export async function obtener(req, res, next) {
    try {
        const marca = await obtenerMarca(req.params.id);
        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }
        res.json(marca);
    } catch (err) {
        next(err);
    }
}

export async function crear(req, res, next) {
    try {
        const { nombre_marca } = req.body;
        if (!nombre_marca) {
            return res.status(400).json({ error: 'nombre_marca es obligatorio' });
        }

        const nuevaMarca = await registrarMarca({ nombre_marca });
        res.status(201).json(nuevaMarca);
    } catch (err) {
        next(err);
    }
}

export async function actualizar(req, res, next) {
    try {
        const { nombre_marca } = req.body;
        if (!nombre_marca) {
            return res.status(400).json({ error: 'nombre_marca es obligatorio' });
        }

        const marca = await editarMarca(req.params.id, { nombre_marca });
        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }
        res.json(marca);
    } catch (err) {
        next(err);
    }
}

export async function eliminar(req, res, next) {
    try {
        const eliminada = await borrarMarca(req.params.id);
        if (!eliminada) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }
        res.json({ mensaje: 'Marca eliminada', id_marca: eliminada.id_marca });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar: hay productos que usan esta marca',
            });
        }
        next(err);
    }
}
