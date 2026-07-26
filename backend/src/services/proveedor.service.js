import {
    listarProveedores,
    obtenerProveedorPorId,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
} from "../models/proveedor.model.js";

export async function obtenerListaProveedores() {
    return listarProveedores();
}

export async function obtenerProveedor(id_proveedor) {
    return obtenerProveedorPorId(id_proveedor);
}

export async function registrarProveedor(datos) {
    return crearProveedor(datos);
}

export async function editarProveedor(id_proveedor, campos) {
    return actualizarProveedor(id_proveedor, campos);
}

export async function borrarProveedor(id_proveedor) {
    return eliminarProveedor(id_proveedor);
}
