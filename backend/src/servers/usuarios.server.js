import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORTH_USUARIOS } from '../config.js';
import usuariosRoutes from '../routes/usuarios.routes.js';
import configRoutes from '../routes/config.routes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ||  'http://localhost:4200', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// ---- Swagger ----
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Usuarios",
            version: "1.0.0",
            description: "Endpoints de Uusuarios, registro, login y sesión",
        },
        servers: [{ url: `http://localhost:${PORTH_USUARIOS}/api` }],
    },
    apis: ["./src/routes/usuarios.routes.js", "./src/routes/config.routes.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/usuarios', usuariosRoutes);
app.use('/api', configRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'usuarios' }));

app.listen(PORTH_USUARIOS, () => {
    console.log(`Usuarios service corriendo en el puerto :${PORTH_USUARIOS}`);
    console.log(`Docs en :${PORTH_USUARIOS}/api-docs`);
});