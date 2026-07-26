import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT_VENTAS } from '../config.js';
import ventasRoutes from '../routes/ventas.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// ---- Swagger ----
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Ventas",
            version: "1.0.0",
            description: "Registro de ventas y generación de tickets",
        },
        servers: [{ url: `http://localhost:${PORT_VENTAS}/api` }],
    },
    apis: ["./src/routes/ventas.routes.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/ventas', ventasRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ventas' }));

app.listen(PORT_VENTAS, () => {
    console.log(`Ventas service corriendo en http://localhost:${PORT_VENTAS}`);
    console.log(`Docs en http://localhost:${PORT_VENTAS}/api-docs`);
});