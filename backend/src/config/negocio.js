import dotenv from "dotenv";
dotenv.config();

// Datos fijos del negocio que aparecen en cada ticket. No cambian por
// venta, por eso viven en config/.env y no en la base de datos.
export const NEGOCIO = {
    nombreComercial: process.env.EMPRESA_NOMBRE_COMERCIAL || "Mi Negocio",
    razonSocial: process.env.EMPRESA_RAZON_SOCIAL || "",
    rfc: process.env.EMPRESA_RFC || "",
    regimenFiscal: process.env.EMPRESA_REGIMEN_FISCAL || "",
    direccion: process.env.EMPRESA_DIRECCION || "",
    telefono: process.env.EMPRESA_TELEFONO || "",
    correo: process.env.EMPRESA_CORREO || "",
    politicaDevolucion:
        process.env.EMPRESA_POLITICA_DEVOLUCION ||
        "Cambios y devoluciones dentro de los primeros 3 días con ticket original.",
};
