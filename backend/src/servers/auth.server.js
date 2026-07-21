import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT_AUTH } from '../config.js';
import authRoutes from '../routes/auth.routes.js';
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
            title: "API de Autenticación",
            version: "1.0.0",
            description: "Endpoints de registro, login y sesión",
        },
        servers: [{ url: `http://localhost:${PORT_AUTH}/api` }],
    },
    apis: ["./src/routes/auth.routes.js", "./src/routes/config.routes.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', authRoutes);
app.use('/api', configRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'auth' }));

app.listen(PORT_AUTH, () => {
    console.log(`Auth service corriendo en http://localhost:${PORT_AUTH}`);
    console.log(`Docs en http://localhost:${PORT_AUTH}/api-docs`);
});