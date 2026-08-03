import { Router } from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { listar, actual, abrir, cerrar } from '../controllers/turnos.controller.js';

const router = Router();
router.get('/', verificarToken, esAdmin, listar);
router.get('/actual', verificarToken, actual);
router.post('/', verificarToken, abrir);
router.patch('/:id/cerrar', verificarToken, cerrar);
export default router;
