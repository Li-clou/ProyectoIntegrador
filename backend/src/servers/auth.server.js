import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT_AUTH } from '../config.js';
import authRoutes from '../routes/auth.routes.js';
import configRoutes from '../routes/config.routes.js';
import dashboardRoutes from '../routes/dashboard.routes.js'; // 👈 NUEVO
import turnosRoutes from '../routes/turnos.routes.js';       // 👈 NUEVO

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// ---- Swagger ----
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Autenticación",
            version: "1.0.0",
            description: "Endpoints de registro, login, sesión, dashboard y turnos",
        },
        servers: [{ url: `http://localhost:${PORT_AUTH}/api` }],
    },
    apis: [
        "./src/routes/auth.routes.js",
        "./src/routes/config.routes.js",
        "./src/routes/dashboard.routes.js", // 👈 NUEVO
        "./src/routes/turnos.routes.js",    // 👈 NUEVO
    ],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', authRoutes);
app.use('/api', configRoutes);
app.use('/api/dashboard', dashboardRoutes); // 👈 NUEVO
app.use('/api/turnos', turnosRoutes);       // 👈 NUEVO

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'auth' }));

app.listen(PORT_AUTH, () => {
    console.log(`Auth service corriendo en el puerto :${PORT_AUTH}`);
    console.log(`Docs en :${PORT_AUTH}/api-docs`);
});
