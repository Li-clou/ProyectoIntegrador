import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/marcas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Marca:
 *       type: object
 *       properties:
 *         id_marca:
 *           type: integer
 *           example: 1
 *         nombre_marca:
 *           type: string
 *           example: Nestlé
 *     MarcaInput:
 *       type: object
 *       required:
 *         - nombre_marca
 *       properties:
 *         nombre_marca:
 *           type: string
 *           example: Nestlé
 */

/**
 * @swagger
 * tags:
 *   name: Marcas
 *   description: CRUD de marcas de producto
 */

/**
 * @swagger
 * /marcas:
 *   get:
 *     summary: Lista todas las marcas
 *     tags: [Marcas]
 *     responses:
 *       200: { description: Lista de marcas }
 */
router.get('/', verificarToken, listar);

/**
 * @swagger
 * /marcas/{id}:
 *   get:
 *     summary: Obtiene una marca por id
 *     tags: [Marcas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Marca encontrada }
 *       404: { description: Marca no encontrada }
 */
router.get('/:id', verificarToken, obtener);

/**
 * @swagger
 * /marcas:
 *   post:
 *     summary: Crea una marca
 *     tags: [Marcas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarcaInput'
 *     responses:
 *       201: { description: Marca creada }
 *       400: { description: Falta nombre_marca }
 */
router.post('/', verificarToken, crear);

/**
 * @swagger
 * /marcas/{id}:
 *   put:
 *     summary: Actualiza una marca
 *     tags: [Marcas]
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
 *             $ref: '#/components/schemas/MarcaInput'
 *     responses:
 *       200: { description: Marca actualizada }
 *       404: { description: Marca no encontrada }
 */
router.put('/:id', verificarToken, actualizar);

/**
 * @swagger
 * /marcas/{id}:
 *   delete:
 *     summary: Elimina una marca
 *     tags: [Marcas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Marca eliminada }
 *       404: { description: Marca no encontrada }
 *       409: { description: Hay productos usando esta marca }
 */
router.delete('/:id', verificarToken, eliminar);

export default router;
