import { Router } from 'express';
import { getDashboardStats, getCajerosActivos } from '../controllers/dashboard.controller.js';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/stats', verificarToken, esAdmin, getDashboardStats);
router.get('/cajeros-activos', verificarToken, esAdmin, getCajerosActivos); // 👈 NUEVO
export default router;