import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT } from './config.js';
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import productosRoutes from './routes/productos.routes.js';
import marcasRoutes from './routes/marcas.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ventasRoutes from './routes/ventas.routes.js';


const app = express();

// ---- Middlewares base ----
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// ---- Swagger ----
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Usuarios",
            version: "1.0.0",
            description: "Documentación de las  API's",
        },
        servers: [
            { url: `http://localhost:${PORT}/api` }
        ],
    },
    apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Rutas ----
app.use('/api', authRoutes);
app.use('/api', configRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/ventas', ventasRoutes);


/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Estado del servidor
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica que el servidor esté funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   example: 2026-07-14T17:44:00.000Z
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.get('/', (req, res) => {
    res.send('Hello, integradora!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Docs en http://localhost:${PORT}/api-docs`);
});