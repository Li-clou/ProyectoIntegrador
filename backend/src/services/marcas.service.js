import {
    listarMarcas,
    obtenerMarcaPorId,
    crearMarca,
    actualizarMarca,
    eliminarMarca,
} from "../models/marcas.model.js";

export async function obtenerListaMarcas() {
    return listarMarcas();
}

export async function obtenerMarca(id_marca) {
    return obtenerMarcaPorId(id_marca);
}

export async function registrarMarca(datos) {
    return crearMarca(datos);
}

export async function editarMarca(id_marca, datos) {
    return actualizarMarca(id_marca, datos);
}

export async function borrarMarca(id_marca) {
    return eliminarMarca(id_marca);
}
