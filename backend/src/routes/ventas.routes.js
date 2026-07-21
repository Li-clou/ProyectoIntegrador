import { Router } from "express";
import { crear, obtener, ticket } from "../controllers/ventas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemVentaInput:
 *       type: object
 *       required:
 *         - id_producto_dv
 *         - cantidad
 *       properties:
 *         id_producto_dv:
 *           type: integer
 *           example: 1
 *         cantidad:
 *           type: integer
 *           example: 2
 *     VentaInput:
 *       type: object
 *       required:
 *         - id_usuario_v
 *         - metodo_pago
 *         - items
 *       properties:
 *         id_cliente_v:
 *           type: integer
 *           nullable: true
 *           example: null
 *         id_usuario_v:
 *           type: integer
 *           example: 1
 *         tipo_venta:
 *           type: string
 *           enum: [mesa, llevar, delivery]
 *           example: mesa
 *         numero_mesa:
 *           type: integer
 *           example: 8
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, qr, vales, credito]
 *           example: efectivo
 *         propina:
 *           type: number
 *           example: 10
 *         descuento:
 *           type: number
 *           example: 5
 *           description: Monto fijo a descontar del subtotal
 *         monto_recibido:
 *           type: number
 *           example: 100
 *           description: Solo aplica si metodo_pago es "efectivo"; calcula el cambio automáticamente
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemVentaInput'
 *     TicketInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: cliente@correo.com
 *           description: Opcional. Si se manda, además envía el PDF por correo.
 */

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Registro de ventas y generación de tickets
 */

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registra una venta completa (descuenta stock automáticamente)
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VentaInput'
 *     responses:
 *       201: { description: Venta registrada }
 *       400: { description: Datos inválidos o stock insuficiente }
 *       404: { description: Algún producto no existe }
 */
router.post('/', verificarToken, crear);

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtiene una venta con todos sus productos
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Venta encontrada }
 *       404: { description: Venta no encontrada }
 */
router.get('/:id', verificarToken, obtener);

/**
 * @swagger
 * /ventas/{id}/ticket:
 *   post:
 *     summary: Genera el ticket en PDF (bajo demanda). Si se manda email, también lo envía por correo.
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       200:
 *         description: PDF del ticket
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       404: { description: Venta no encontrada }
 */
router.post('/:id/ticket', verificarToken, ticket);

export default router;