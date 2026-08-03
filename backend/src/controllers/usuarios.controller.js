import {
    obtenerListaUsuarios,
    obtenerUsuario,
    registrarUsuarioDesdeAdmin,
    editarUsuario,
    borrarUsuario,
} from "../services/usuarios.service.js";

export async function listar(req, res, next) {
    try {
        const usuarios = await obtenerListaUsuarios();
        res.json(usuarios);
    } catch (err) {
        next(err);
    }
}

export async function obtener(req, res, next) {
    try {
        const usuario = await obtenerUsuario(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        next(err);
    }
}
//esto no se va a ocupar, ya que el registro de usuarios se hace desde el admin
export async function crear(req, res, next) {
    try {
        const { nombre_us, ap_us, am_us, usuario, email, password } = req.body;
        if (!nombre_us || !ap_us || !am_us || !usuario || !email || !password) {
            return res.status(400).json({
                error: 'nombre_us, ap_us, am_us, usuario y password son obligatorios',
            });
        }

        const nuevo = await registrarUsuarioDesdeAdmin(req.body);
        res.status(201).json(nuevo);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }
        next(err);
    }
}

//aqui se hace la edicion de usuarios, solo el admin puede editar usuarios y aqui hacemos los cajeros y a los admins
export async function actualizar(req, res, next) {
    try {
        const camposPermitidos = ['nombre_us', 'ap_us', 'am_us', 'direccion', 'telefono', 'email', 'rol'];
        const campos = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) campos[campo] = req.body[campo];
        }
        if (!Object.keys(campos).length) {
            return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
        }

        const usuario = await editarUsuario(req.params.id, campos);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        next(err);
    }
}
//eliminar usuarios
export async function eliminar(req, res, next) {
    try {
        if (Number(req.params.id) === req.usuario.id_usuario) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const eliminado = await borrarUsuario(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado', id_usuario: eliminado.id_usuario });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar: el usuario tiene ventas o turnos asociados',
            });
        }
        next(err);
    }
}
