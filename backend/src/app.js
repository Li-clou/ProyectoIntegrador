import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT_AUTH as PORT } from './config.js';
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import productosRoutes from './routes/productos.routes.js';
import marcasRoutes from './routes/marcas.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import turnosRoutes from './routes/turnos.routes.js';

const app = express();

// Configuración de CORS robusta y a prueba de fallos
app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'], // Permite ambas resoluciones
    credentials: true, // Fundamental para aceptar cookies (JWT)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Permite todos los verbos
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Usuarios",
            version: "1.0.0",
            description: "Documentación de las APIs",
        },
        servers: [
            { url: `http://localhost:${PORT}/api` }
        ],
    },
    apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/turnos', turnosRoutes); 
app.use('/api', authRoutes);
app.use('/api', configRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => res.send('Hello, integradora!'));

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
    console.error("Error detectado en el servidor:", err);
    res.status(500).json({ error: 'Ocurrió un error en el servidor', detalle: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Docs en http://localhost:${PORT}/api-docs`);
});