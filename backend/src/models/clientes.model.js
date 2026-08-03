import pool from '../config/db.js';

export async function listarClientes(buscar = '') {
    const result = await pool.query(
        `SELECT id_cliente, nombre_cliente, "RFC" AS rfc, domicilio, telefono
         FROM cliente
         WHERE $1 = '' OR nombre_cliente ILIKE '%' || $1 || '%' OR telefono ILIKE '%' || $1 || '%'
         ORDER BY nombre_cliente`, [buscar]
    );
    return result.rows;
}
export async function obtenerCliente(id) { const r = await pool.query('SELECT id_cliente, nombre_cliente, "RFC" AS rfc, domicilio, telefono FROM cliente WHERE id_cliente=$1',[id]); return r.rows[0]||null; }
export async function crearCliente(c) { const r=await pool.query('INSERT INTO cliente (nombre_cliente,"RFC",domicilio,telefono) VALUES ($1,$2,$3,$4) RETURNING id_cliente,nombre_cliente,"RFC" AS rfc,domicilio,telefono',[c.nombre_cliente,c.rfc||null,c.domicilio||null,c.telefono||null]); return r.rows[0]; }
export async function actualizarCliente(id,c) { const r=await pool.query('UPDATE cliente SET nombre_cliente=$2,"RFC"=$3,domicilio=$4,telefono=$5 WHERE id_cliente=$1 RETURNING id_cliente,nombre_cliente,"RFC" AS rfc,domicilio,telefono',[id,c.nombre_cliente,c.rfc||null,c.domicilio||null,c.telefono||null]); return r.rows[0]||null; }
export async function eliminarCliente(id) { const r=await pool.query('DELETE FROM cliente WHERE id_cliente=$1 RETURNING id_cliente',[id]); return r.rows[0]||null; }
