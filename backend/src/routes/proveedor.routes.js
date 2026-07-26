import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/proveedor.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Proveedor:
 *       type: object
 *       properties:
 *         id_proveedor:
 *           type: integer
 *           example: 1
 *         nombre_pv:
 *           type: string
 *           example: Distribuidora del Norte
 *         direccion_pv:
 *           type: string
 *           example: Blvd. Domínguez 450, Durango
 *         telefono_pv:
 *           type: string
 *           example: "6181234567"
 *     ProveedorInput:
 *       type: object
 *       required:
 *         - nombre_pv
 *       properties:
 *         nombre_pv:
 *           type: string
 *         direccion_pv:
 *           type: string
 *         telefono_pv:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: CRUD de proveedores
 */

/**
 * @swagger
 * /proveedor:
 *   get:
 *     summary: Lista todos los proveedores
 *     tags: [Proveedores]
 *     responses:
 *       200: { description: Lista de proveedores }
 */
router.get('/', verificarToken, listar);

/**
 * @swagger
 * /proveedor/{id}:
 *   get:
 *     summary: Obtiene un proveedor por id
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Proveedor encontrado }
 *       404: { description: Proveedor no encontrado }
 */
router.get('/:id', verificarToken, obtener);

/**
 * @swagger
 * /proveedor:
 *   post:
 *     summary: Crea un proveedor
 *     tags: [Proveedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProveedorInput'
 *     responses:
 *       201: { description: Proveedor creado }
 *       400: { description: Falta nombre_pv }
 */
router.post('/', verificarToken, crear);

/**
 * @swagger
 * /proveedor/{id}:
 *   put:
 *     summary: Actualiza un proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProveedorInput'
 *     responses:
 *       200: { description: Proveedor actualizado }
 *       404: { description: Proveedor no encontrado }
 */
router.put('/:id', verificarToken, actualizar);

/**
 * @swagger
 * /proveedor/{id}:
 *   delete:
 *     summary: Elimina un proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Proveedor eliminado }
 *       404: { description: Proveedor no encontrado }
 *       409: { description: Hay productos usando este proveedor }
 */
router.delete('/:id', verificarToken, eliminar);

export default router;
