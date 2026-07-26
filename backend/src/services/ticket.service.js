import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { NEGOCIO } from "../config/negocio.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // 465 = SSL directo (Gmail), 587 = STARTTLS (Ethereal, etc.)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const MARGEN = 14;
const ANCHO_UTIL = 226 - MARGEN * 2; // ancho de impresión útil

// Posiciones de columnas para la tabla de productos
const COL_CANT = MARGEN;
const COL_CANT_ANCHO = 26;
const COL_PU = COL_CANT + COL_CANT_ANCHO;
const COL_PU_ANCHO = 88;
const COL_TOTAL = COL_PU + COL_PU_ANCHO;
const COL_TOTAL_ANCHO = ANCHO_UTIL - COL_CANT_ANCHO - COL_PU_ANCHO;

function linea(doc) {
    doc.moveTo(MARGEN, doc.y).lineTo(MARGEN + ANCHO_UTIL, doc.y).stroke();
    doc.moveDown(0.6);
}

function filaMonto(doc, etiqueta, monto, opts = {}) {
    doc.fontSize(opts.size || 9).text(
        `${etiqueta}${' '.repeat(Math.max(1, 22 - etiqueta.length))}$${Number(monto).toFixed(2)}`,
        { align: 'right' }
    );
    doc.moveDown(0.25);
}

// Imprime una fila de 3 columnas alineadas (cantidad / precio unit / total)
// a una altura fija, y luego avanza el cursor manualmente.
function filaColumnas(doc, cant, pUnit, total, opts = {}) {
    const y = doc.y;
    const size = opts.size || 8;
    const bold = opts.bold ? 'Helvetica-Bold' : 'Helvetica';
    doc.font(bold).fontSize(size);
    doc.text(cant, COL_CANT, y, { width: COL_CANT_ANCHO });
    doc.text(pUnit, COL_PU, y, { width: COL_PU_ANCHO });
    doc.text(total, COL_TOTAL, y, { width: COL_TOTAL_ANCHO, align: 'right' });
    doc.font('Helvetica');
    doc.x = MARGEN;
    doc.y = y + size + 6; // avanza el cursor lo suficiente para no encimar texto
}

// Genera el PDF del ticket en memoria (sin escribir a disco) y regresa
// un Buffer, tamaño angosto tipo ticket de tienda (80mm de ancho).
export function generarTicketPDF(venta) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: [226, 850], margin: MARGEN });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ---------- 1. Datos de la empresa ----------
        doc.fontSize(14).text(NEGOCIO.nombreComercial, { align: 'center' });
        doc.moveDown(0.2);
        if (NEGOCIO.razonSocial) {
            doc.fontSize(7.5).text(NEGOCIO.razonSocial, { align: 'center' });
            doc.moveDown(0.15);
        }
        if (NEGOCIO.rfc) {
            doc.fontSize(7.5).text(`RFC: ${NEGOCIO.rfc}`, { align: 'center' });
            doc.moveDown(0.15);
        }
        if (NEGOCIO.direccion) {
            doc.fontSize(7.5).text(NEGOCIO.direccion, { align: 'center' });
            doc.moveDown(0.15);
        }
        if (NEGOCIO.telefono || NEGOCIO.correo) {
            doc.fontSize(7).text(
                [NEGOCIO.telefono, NEGOCIO.correo].filter(Boolean).join('   ·   '),
                { align: 'center' }
            );
        }
        doc.moveDown(0.8);
        linea(doc);

        // ---------- 2. Datos de la transacción ----------
        doc.fontSize(10).text(`Ticket / Folio: #${venta.id_venta}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(8.5).text(
            new Date(venta.fecha_v).toLocaleString('es-MX', {
                dateStyle: 'short',
                timeStyle: 'short',
            }),
            { align: 'center' }
        );
        doc.moveDown(0.2);
        doc.text(`Pago: ${venta.metodo_pago}`, { align: 'center' });
        if (venta.nombre_cliente) {
            doc.moveDown(0.2);
            doc.text(`Cliente: ${venta.nombre_cliente}`, { align: 'center' });
        }
        if (venta.nombre_us) {
            doc.moveDown(0.2);
            doc.text(`Atendió: ${venta.nombre_us} ${venta.ap_us || ''}`, { align: 'center' });
        }
        doc.moveDown(0.8);
        linea(doc);

        // ---------- 3. Detalle de la compra ----------
        doc.fontSize(9).font('Helvetica-Bold').text('PRODUCTOS', { align: 'left' });
        doc.font('Helvetica');
        doc.moveDown(0.4);

        filaColumnas(doc, 'CANT', 'P. UNIT', 'TOTAL', { size: 7.5, bold: true });
        doc.moveDown(0.3);
        linea(doc);

        venta.items.forEach((item, idx) => {
            const importe = Number(item.precio_s_dv) * item.cantidad;

            doc.fontSize(8.5).text(item.nombre_producto, MARGEN, doc.y, { width: ANCHO_UTIL });
            doc.moveDown(0.15);
            filaColumnas(
                doc,
                String(item.cantidad),
                `$${Number(item.precio_s_dv).toFixed(2)}`,
                `$${importe.toFixed(2)}`
            );

            // separación entre productos, más marcada si no es el último
            if (idx < venta.items.length - 1) {
                doc.moveDown(0.5);
            }
        });

        doc.moveDown(0.6);
        linea(doc);

        // ---------- 4. Desglose financiero ----------
        filaMonto(doc, 'Subtotal:', venta.subtotal);
        if (Number(venta.descuento) > 0) {
            filaMonto(doc, 'Descuento:', -Number(venta.descuento));
        }
        const baseGravable = Number(venta.subtotal) - Number(venta.descuento || 0);
        const porcentajeIva = baseGravable > 0
            ? Math.round((Number(venta.iva_total) / baseGravable) * 100)
            : 0;
        filaMonto(doc, `IVA (${porcentajeIva}%):`, venta.iva_total);
        if (Number(venta.propina) > 0) {
            filaMonto(doc, 'Propina:', venta.propina);
        }
        doc.moveDown(0.3);
        filaMonto(doc, 'TOTAL:', venta.total, { size: 12 });

        if (venta.metodo_pago === 'efectivo' && venta.monto_recibido !== null) {
            doc.moveDown(0.4);
            filaMonto(doc, 'Recibido:', venta.monto_recibido);
            filaMonto(doc, 'Cambio:', venta.cambio);
        }

        doc.moveDown(0.8);
        linea(doc);

        // ---------- 5. Información adicional ----------
        doc.fontSize(7).text(NEGOCIO.politicaDevolucion, { align: 'center' });
        if (NEGOCIO.regimenFiscal) {
            doc.moveDown(0.4);
            doc.text(`Régimen fiscal: ${NEGOCIO.regimenFiscal}`, { align: 'center' });
        }
        doc.moveDown(0.8);
        doc.fontSize(9).text('¡Gracias por tu compra!', { align: 'center' });

        doc.end();
    });
}

export async function enviarTicketPorCorreo(email, pdfBuffer, venta) {
    await transporter.sendMail({
        from: `"Mi Negocio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Tu ticket de compra #${venta.id_venta}`,
        html: `
            <p>¡Gracias por tu compra!</p>
            <p>Total: <strong>$${Number(venta.total).toFixed(2)}</strong></p>
            <p>Adjuntamos tu ticket en PDF.</p>
        `,
        attachments: [
            { filename: `ticket-${venta.id_venta}.pdf`, content: pdfBuffer },
        ],
    });
}