import { Router } from 'express';
import { 
    getDashboardStats, 
    getCajerosActivos, 
    getGraficaVentas, 
    getInventarioBajoDetalle, 
    getCambiosTurno, 
    getVentasRecientes // <-- Importación agregada
} from '../controllers/dashboard.controller.js';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/stats', verificarToken, esAdmin, getDashboardStats);
router.get('/cajeros-activos', verificarToken, esAdmin, getCajerosActivos);
router.get('/grafica', verificarToken, esAdmin, getGraficaVentas);
router.get('/inventario-bajo', verificarToken, esAdmin, getInventarioBajoDetalle);
router.get('/turnos-recientes', verificarToken, esAdmin, getCambiosTurno);
router.get('/ventas-recientes', verificarToken, esAdmin, getVentasRecientes); // <-- Ruta agregada

export default router;