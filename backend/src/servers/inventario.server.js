import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT_INVENTARIO } from '../config.js';
import productosRoutes from '../routes/productos.routes.js';
import marcasRoutes from '../routes/marcas.routes.js';
import proveedorRoutes from '../routes/proveedor.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// ---- Swagger ----
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Inventario",
            version: "1.0.0",
            description: "Productos, marcas y proveedores",
        },
        servers: [{ url: `http://localhost:${PORT_INVENTARIO}/api` }],
    },
    apis: [
        "./src/routes/productos.routes.js",
        "./src/routes/marcas.routes.js",
        "./src/routes/proveedor.routes.js",
    ],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/productos', productosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/proveedor', proveedorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'inventario' }));

app.listen(PORT_INVENTARIO, () => {
    console.log(`Inventario service corriendo en http://localhost:${PORT_INVENTARIO}`);
    console.log(`Docs en http://localhost:${PORT_INVENTARIO}/api-docs`);
});