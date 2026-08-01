import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/usuarios.controller.js";
import { verificarToken, esAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: CRUD de usuarios del sistema (solo administradores)
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200: { description: Lista de usuarios }
 *       403: { description: Solo administradores }
 */
router.get('/', verificarToken, esAdmin, listar);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por id
 *     tags: [Usuarios]
 *     responses:
 *       200: { description: Usuario encontrado }
 *       404: { description: Usuario no encontrado }
 */
router.get('/:id', verificarToken, esAdmin, obtener);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un usuario (opcionalmente con rol ya asignado)
 *     tags: [Usuarios]
 *     responses:
 *       201: { description: Usuario creado }
 *       409: { description: Usuario ya existe }
 */
router.post('/', verificarToken, esAdmin, crear);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza datos o rol de un usuario
 *     tags: [Usuarios]
 *     responses:
 *       200: { description: Usuario actualizado }
 *       404: { description: Usuario no encontrado }
 */
router.put('/:id', verificarToken, esAdmin, actualizar);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     tags: [Usuarios]
 *     responses:
 *       200: { description: Usuario eliminado }
 *       404: { description: Usuario no encontrado }
 *       409: { description: Tiene ventas o turnos asociados }
 */
router.delete('/:id', verificarToken, esAdmin, eliminar);

export default router;