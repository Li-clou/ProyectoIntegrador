import { Router } from "express";
import { GOOGLE_CLIENT_ID } from "../config.js";

const router = Router();

/**
 * @swagger
 * /config:
 *   get:
 *     summary: Configuracion publica del frontend (no incluye secretos)
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Configuracion publica
 */
router.get('/config', (req, res) => {
    res.json({
        googleClientId: GOOGLE_CLIENT_ID
    });
});

export default router;