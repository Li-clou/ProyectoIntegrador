import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js'; // Asumiendo que tienes middlewares de seguridad

const router = Router();
router.get('/stats', verificarToken, esAdmin, getDashboardStats);
export default router;