import {
    listarProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    ajustarStock,
    marcarAlertaEnviada,
} from "../models/productos.model.js";
import { notificarStockBajo } from "./notificaciones.service.js";

// Revisa si el producto quedó en o debajo del mínimo y dispara la
// notificación una sola vez por caída (usa alerta_enviada como bandera
// para no mandar correo/whatsapp repetido en cada venta).
// Exportada porque ventas.service.js también la necesita después de
// descontar stock por una venta.
export async function revisarStockYNotificar(id_producto) {
    const producto = await obtenerProductoPorId(id_producto);
    if (!producto) return;

    if (producto.existencia <= producto.stock_minimo) {
        if (!producto.alerta_enviada) {
            await notificarStockBajo(producto);
            await marcarAlertaEnviada(id_producto, true);
        }
    } else if (producto.alerta_enviada) {
        await marcarAlertaEnviada(id_producto, false);
    }
}

export async function obtenerListaProductos(filtros) {
    return listarProductos(filtros);
}

export async function obtenerProducto(id_producto) {
    return obtenerProductoPorId(id_producto);
}

export async function registrarProducto(datos) {
    const producto = await crearProducto(datos);
    await revisarStockYNotificar(producto.id_producto);
    return producto;
}

export async function editarProducto(id_producto, campos) {
    const producto = await actualizarProducto(id_producto, campos);
    if (!producto) return null;
    await revisarStockYNotificar(id_producto);
    return producto;
}

export async function borrarProducto(id_producto) {
    return eliminarProducto(id_producto);
}

export async function moverStock(id_producto, cantidad, tipo) {
    const resultado = await ajustarStock(id_producto, cantidad, tipo);
    if (resultado.error) return resultado;
    await revisarStockYNotificar(id_producto);
    return resultado;
}
