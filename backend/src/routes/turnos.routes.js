import { Router } from "express";
import { miTurno, cerrar, historial } from "../controllers/turnos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Apertura y cierre de turnos de caja
 */

/**
 * @swagger
 * /turnos/mi-turno:
 *   get:
 *     summary: Regresa el turno abierto del usuario logueado (o null)
 *     tags: [Turnos]
 *     responses:
 *       200: { description: Turno activo o null }
 */
router.get('/mi-turno', verificarToken, miTurno);

/**
 * @swagger
 * /turnos/cerrar:
 *   post:
 *     summary: Cierra el turno abierto del usuario logueado
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto_final]
 *             properties:
 *               monto_final:
 *                 type: number
 *     responses:
 *       200: { description: Turno cerrado con resumen de ventas }
 *       400: { description: No hay turno abierto }
 */
router.post('/cerrar', verificarToken, cerrar);

/**
 * @swagger
 * /turnos/historial:
 *   get:
 *     summary: Historial de los últimos 20 turnos del usuario logueado
 *     tags: [Turnos]
 *     responses:
 *       200: { description: Lista de turnos }
 */
router.get('/historial', verificarToken, historial);

export default router;