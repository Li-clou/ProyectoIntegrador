// src/config.js
import dotenv from 'dotenv';
dotenv.config();

export const {
    PORT_AUTH = 3000,
    PORTH_USUARIOS = 3003,
    PORT_INVENTARIO = 3001,
    PORT_VENTAS = 3002,
    SALT_ROUNDS = 10,
    GOOGLE_CLIENT_ID,
} = process.env;