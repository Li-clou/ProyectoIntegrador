import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORTH_USUARIOS } from '../config.js';
import usuariosRoutes from '../routes/usuarios.routes.js';
import configRoutes from '../routes/config.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
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

app.use('/api', usuariosRoutes);
app.use('/api', configRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'auth' }));

app.listen(PORTH_USUARIOS, () => {
    console.log(`Usuarios service corriendo en http://localhost:${PORTH_USUARIOS}`);
    console.log(`Docs en http://localhost:${PORTH_USUARIOS}/api-docs`);
});