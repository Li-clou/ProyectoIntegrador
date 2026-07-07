import pool from './db.js'; 
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión exitosa a PostgreSQL');
        
        const result = await client.query('SELECT NOW()');
        console.log('Hora del servidor:', result.rows[0].now);
        
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
        process.exit(1);
    }
}

testConnection();