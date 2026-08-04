import {
    buscarTurnoAbierto,
    calcularResumenTurno,
    cerrarTurno,
    listarHistorialTurnos,
} from "../models/turnos.model.js";

export async function obtenerMiTurnoActivo(id_usuario) {
    const turno = await buscarTurnoAbierto(id_usuario);
    if (!turno) return null;

    const resumen = await calcularResumenTurno(turno.id_turno);
    return {
        ...turno,
        totalVendido: parseFloat(resumen.total_vendido),
        transacciones: parseInt(resumen.transacciones),
    };
}

export async function cerrarTurnoCajero(id_usuario, monto_final) {
    const turno = await buscarTurnoAbierto(id_usuario);
    if (!turno) return { error: 'SIN_TURNO_ABIERTO' };

    const resumen = await calcularResumenTurno(turno.id_turno);
    const totalVendido = parseFloat(resumen.total_vendido);

    const turnoCerrado = await cerrarTurno(turno.id_turno, monto_final, totalVendido);
    return { turno: turnoCerrado, totalVendido, transacciones: parseInt(resumen.transacciones) };
}

export async function obtenerHistorial(id_usuario) {
    return listarHistorialTurnos(id_usuario);
}