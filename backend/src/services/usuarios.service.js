import { registrarUsuario } from "./auth.service.js";
import {
    listarUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario,
} from "../models/usuarios.model.js";

export async function obtenerListaUsuarios() {
    return listarUsuarios();
}

export async function obtenerUsuario(id_usuario) {
    return obtenerUsuarioPorId(id_usuario);
}

// Reutiliza la lógica de registro (hash de password) y de una vez
// le asigna el rol si el admin lo mandó, en vez de dejarlo pendiente.
export async function registrarUsuarioDesdeAdmin(datos) {
    const { rol, ...datosRegistro } = datos;
    const nuevo = await registrarUsuario(datosRegistro);

    if (rol) {
        return actualizarUsuario(nuevo.id_usuario, { rol });
    }
    return obtenerUsuarioPorId(nuevo.id_usuario);
}

export async function editarUsuario(id_usuario, campos) {
    return actualizarUsuario(id_usuario, campos);
}

export async function borrarUsuario(id_usuario) {
    return eliminarUsuario(id_usuario);
}