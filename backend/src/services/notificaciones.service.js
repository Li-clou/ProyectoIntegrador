import nodemailer from "nodemailer";
import twilio from "twilio";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true para puerto 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const twilioClient =
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        : null;

async function enviarCorreoStockBajo(producto) {
    try {
        await transporter.sendMail({
            from: `"Alertas de Inventario" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: `⚠️ Stock bajo: ${producto.nombre_producto}`,
            html: `
                <h2>Alerta de stock bajo</h2>
                <p>El producto <strong>${producto.nombre_producto}</strong> (código ${producto.codigo_producto})
                tiene <strong>${producto.existencia}</strong> unidades disponibles,
                por debajo del mínimo configurado (${producto.stock_minimo}).</p>
                <p>Te recomendamos generar una orden de compra pronto.</p>
            `,
        });
    } catch (err) {
        console.error('Error enviando correo de alerta:', err.message);
    }
}

async function enviarWhatsappStockBajo(producto) {
    if (!twilioClient) {
        console.warn('Twilio no configurado, se omite el envío de WhatsApp.');
        return;
    }
    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: process.env.TWILIO_WHATSAPP_TO,
            body:
                `⚠️ *Stock bajo*\n` +
                `Producto: ${producto.nombre_producto}\n` +
                `Código: ${producto.codigo_producto}\n` +
                `Existencia actual: ${producto.existencia}\n` +
                `Mínimo configurado: ${producto.stock_minimo}\n` +
                `Genera una orden de compra pronto.`,
        });
    } catch (err) {
        console.error('Error enviando WhatsApp de alerta:', err.message);
    }
}

export async function notificarStockBajo(producto) {
    await Promise.all([
        enviarCorreoStockBajo(producto),
        enviarWhatsappStockBajo(producto),
    ]);
}
