import pool from "../config/db.js";

export async function crearUsuario({ nombre_us, ap_us, am_us, direccion, telefono, usuario, passwordHash }) {
    const sql = `INSERT INTO usuarios (nombre_us, ap_us, am_us, direccion, telefono, usuario, password)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`;
    const resultado = await pool.query(sql, [nombre_us, ap_us, am_us, direccion, telefono, usuario, passwordHash]);
    return resultado.rows[0];
}

export async function buscarPorUsuario(usuario) {
    const resultado = await pool.query(
        'SELECT id_usuario, nombre_us, ap_us, am_us, direccion, telefono, usuario, password FROM usuarios WHERE usuario = $1',
        [usuario]
    );
    return resultado.rows[0] || null;
}

export async function buscarPorGoogleId(google_id) {
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE google_id = $1',
        [google_id]
    );
    return resultado.rows[0] || null;
}

export async function buscarPorEmail(email) {
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
    );
    return resultado.rows[0] || null;
}

export async function crearUsuarioGoogle({ nombre_us, ap_us, am_us, usuario, email, google_id }) {
    const sql = `INSERT INTO usuarios (nombre_us, ap_us, am_us, usuario, email, google_id)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const resultado = await pool.query(sql, [nombre_us, ap_us, am_us, usuario, email, google_id]);
    return resultado.rows[0];
}