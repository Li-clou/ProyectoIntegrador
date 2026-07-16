import { Router } from "express";
import { registro, login, logout, me, googleLogin } from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id_usuario:
 *           type: integer
 *           example: 1
 *         nombre_us:
 *           type: string
 *           example: Juan
 *         ap_us:
 *           type: string
 *           example: Perez
 *         am_us:
 *           type: string
 *           example: Lopez
 *         direccion:
 *           type: string
 *           example: Calle Falsa 123
 *         telefono:
 *           type: string
 *           example: "6181234567"
 *         usuario:
 *           type: string
 *           example: jperez
 *     RegistroInput:
 *       type: object
 *       required:
 *         - nombre_us
 *         - ap_us
 *         - am_us
 *         - usuario
 *         - password
 *       properties:
 *         nombre_us:
 *           type: string
 *           example: Juan
 *         ap_us:
 *           type: string
 *           example: Perez
 *         am_us:
 *           type: string
 *           example: Lopez
 *         direccion:
 *           type: string
 *           example: Calle Falsa 123
 *         telefono:
 *           type: string
 *           example: "6181234567"
 *         usuario:
 *           type: string
 *           example: jperez
 *         password:
 *           type: string
 *           format: password
 *           example: miPassword123
 *     LoginInput:
 *       type: object
 *       required:
 *         - usuario
 *         - password
 *       properties:
 *         usuario:
 *           type: string
 *           example: jperez
 *         password:
 *           type: string
 *           format: password
 *           example: miPassword123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de registro y autenticacion
 */

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroInput'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Faltan campos obligatorios
 *       409:
 *         description: El usuario ya esta registrado
 */
router.post('/registro', registro);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesion con usuario y password (regresa cookie httpOnly)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Faltan campos obligatorios
 *       401:
 *         description: Credenciales invalidas
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login/registro usando un ID token de Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Token invalido
 */
router.post('/auth/google', googleLogin);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cierra sesion, borra la cookie del token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesion cerrada
 */
router.post('/logout', logout);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Regresa el usuario logueado segun la cookie actual
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: No autenticado o token invalido
 */
router.get('/me', verificarToken, me);

export default router;