import { crearVenta, obtenerVentaCompleta, listarVentas } from "../models/ventas.model.js";
import { revisarStockYNotificar } from "./productos.service.js";
import { generarTicketPDF, enviarTicketPorCorreo } from "./ticket.service.js";

export async function registrarVenta(datos) {
    const resultado = await crearVenta(datos);
    if (resultado.error) return resultado;

    // Después de descontar stock, revisa cada producto vendido por si
    // quedó en o debajo del mínimo (reusa la misma lógica de alertas
    // que ya usa el CRUD de productos).
    for (const item of datos.items) {
        await revisarStockYNotificar(item.id_producto_dv);
    }

    return resultado;
}

export async function obtenerVenta(id_venta) {
    return obtenerVentaCompleta(id_venta);
}

// Para la pantalla de listado: admin ve todas, cajero solo las suyas
// (el filtro por rol se aplica en el controller, aquí solo se pasa
// lo que llegue en filtros).
export async function obtenerListaVentas(filtros) {
    return listarVentas(filtros);
}

// Se genera bajo demanda (botón "imprimir ticket"), nunca automático.
// Si mandan email, además lo envía por correo con el PDF adjunto.
export async function emitirTicket(id_venta, email) {
    const venta = await obtenerVentaCompleta(id_venta);
    if (!venta) return { error: 'NOT_FOUND' };

    const pdfBuffer = await generarTicketPDF(venta);

    if (email) {
        await enviarTicketPorCorreo(email, pdfBuffer, venta);
    }

    return { pdfBuffer };
}