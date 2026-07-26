import { Router } from "express";
import {
    listar, obtener, crear, actualizar, eliminar, ajustarExistencia,
} from "../controllers/productos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           example: BEB-001
 *         nombre_producto:
 *           type: string
 *           example: Coca-Cola 600ml
 *         id_marca_producto:
 *           type: integer
 *           example: 3
 *         precio_compra:
 *           type: number
 *           example: 14.00
 *         precio_venta:
 *           type: number
 *           example: 22.00
 *         existencia:
 *           type: integer
 *           example: 48
 *         stock_minimo:
 *           type: integer
 *           example: 10
 *         iva:
 *           type: integer
 *           example: 16
 *     ProductoInput:
 *       type: object
 *       required:
 *         - codigo
 *         - nombre_producto
 *         - precio_venta
 *       properties:
 *         codigo:
 *           type: string
 *         nombre_producto:
 *           type: string
 *         id_marca_producto:
 *           type: integer
 *         precio_compra:
 *           type: number
 *         precio_venta:
 *           type: number
 *         existencia:
 *           type: integer
 *         stock_minimo:
 *           type: integer
 *     AjusteStockInput:
 *       type: object
 *       required:
 *         - cantidad
 *         - tipo
 *       properties:
 *         cantidad:
 *           type: integer
 *           example: 5
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 */

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: CRUD de inventario y control de stock
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Lista productos (filtros opcionales)
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: buscar
 *         schema: { type: string }
 *       - in: query
 *         name: id_marca
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', verificarToken, listar);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto por id
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Producto encontrado }
 *       404: { description: Producto no encontrado }
 */
router.get('/:id', verificarToken, obtener);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201: { description: Producto creado }
 *       400: { description: Faltan campos obligatorios }
 *       409: { description: Código duplicado }
 */
router.post('/', verificarToken, crear);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza cualquier campo del producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       200: { description: Producto actualizado }
 *       404: { description: Producto no encontrado }
 */
router.put('/:id', verificarToken, actualizar);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Producto eliminado }
 *       404: { description: Producto no encontrado }
 *       409: { description: Tiene ventas/compras asociadas }
 */
router.delete('/:id', verificarToken, eliminar);

/**
 * @swagger
 * /productos/{id}/stock:
 *   patch:
 *     summary: Suma o resta existencia (usar desde el flujo de venta/compra)
 *     tags: [Productos]
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
 *             $ref: '#/components/schemas/AjusteStockInput'
 *     responses:
 *       200: { description: Stock actualizado }
 *       400: { description: Stock insuficiente o datos inválidos }
 *       404: { description: Producto no encontrado }
 */
router.patch('/:id/stock', verificarToken, ajustarExistencia);

export default router;