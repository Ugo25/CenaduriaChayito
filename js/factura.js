// Cambia estos valores por los de tu proyecto Supabase
const supabaseUrl = 'https://exeuxjtrjoultopoynmj.supabase.co'; // ej. https://xxxx.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZXV4anRyam91bHRvcG95bm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjYyMjIsImV4cCI6MjA2MzYwMjIyMn0.g0UuO6jyBJsdnCjS4JmJGvWP2a-D_wAQUQW-8JzLWkY';   // tu anon public key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



async function enviarFactura() {
    const boton = document.querySelector('.btn-verde');
    const textoOriginal = boton.textContent;

    try {
        // Estado de carga
        boton.innerHTML = '<span class="spinner">⏳</span> Procesando...';
        boton.disabled = true;

        // Validar campos obligatorios
        const camposRequeridos = ['folio', 'importe', 'razon', 'rfc', 'correo'];
        const datosFactura = {};

        for (const campo of camposRequeridos) {
            const elemento = document.getElementById(campo);
            datosFactura[campo] = elemento.value.trim();

            if (!datosFactura[campo]) {
                elemento.focus();
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Obtener datos adicionales
        datosFactura.cp = document.getElementById("cp").value;
        datosFactura.regimen = document.getElementById("regimen").value;
        datosFactura.uso = document.getElementById("uso").value;

// 1. Generar el PDF como blob con los datos capturados del formulario
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

// Encabezado color y título
doc.setFillColor(128, 0, 0); // Rojo oscuro
doc.rect(0, 0, 210, 10, "F");
doc.setFontSize(12);
doc.setTextColor(255, 255, 255);
doc.text('CFDI VERSIÓN 4.0', 10, 7);
doc.setTextColor(0, 0, 0);

// Datos básicos de serie y folio
doc.setFontSize(8);
doc.text(`SERIE Y FOLIO: *****`, 170, 7);
doc.text(`NO. DE SERIE DEL CERTIFICADO DEL EMISOR: 00001000000707060420`, 10, 14);
doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleString('es-MX')}`, 10, 18);

// Datos del emisor
doc.setFontSize(9);
doc.text('EMISOR:', 10, 26);
doc.text('Empresa de Prueba S.A. de C.V.', 10, 30);
doc.text('RFC: DEMO010203XYZ', 10, 34);
doc.text(`Régimen Fiscal: ${datosFactura.regimen || "601 - General de Ley Personas Morales"}`, 10, 38);

// Datos del receptor (los del formulario)
doc.text('RECEPTOR:', 110, 26);
doc.text(`Razón Social: ${datosFactura.razon}`, 110, 30);
doc.text(`RFC: ${datosFactura.rfc}`, 110, 34);
doc.text(`Correo: ${datosFactura.correo}`, 110, 38);
doc.text(`CP: ${datosFactura.cp || "00000"}`, 110, 42);
doc.text(`Régimen: ${datosFactura.regimen || "-"}`, 110, 46);
doc.text(`Uso CFDI: ${datosFactura.uso || "-"}`, 110, 50);

// Datos generales
doc.setFontSize(8);
doc.rect(10, 52, 190, 12); // Caja gris para datos generales
doc.text(`LUGAR EXPEDICIÓN: ${datosFactura.cp || "00000"}`, 12, 58);
doc.text(`TIPO COMPROBANTE: I - Ingreso`, 70, 58);
doc.text(`MONEDA: MXN`, 120, 58);
doc.text(`MÉTODO DE PAGO: PUE`, 12, 62);
doc.text(`FORMA DE PAGO: 01 - Efectivo`, 70, 62);

// Tabla de conceptos con jsPDF-AutoTable
const conceptos = [
    [
        '90101501', 'E48', '1.00', '001', datosFactura.descripcion || 'Concepto facturado',
        `$${parseFloat(datosFactura.importe).toFixed(2)}`, '$0.00', `$${parseFloat(datosFactura.importe).toFixed(2)}`
    ]
];

doc.autoTable({
    head: [[
        'CLAVE', 'UNIDAD', 'CANT', 'NO. ID', 'DESCRIPCIÓN', 'VALOR UNITARIO', 'DESC', 'IMPORTE'
    ]],
    body: conceptos,
    startY: 66,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [200, 200, 200] },
    columnStyles: {
        4: { halign: 'left', cellWidth: 50 },
        5: { halign: 'right' },
        7: { halign: 'right' },
    }
});

let tablaFinalY = doc.lastAutoTable.finalY || 75;

// Impuestos (ejemplo básico, puedes parametrizar si tienes diferentes tasas)
const total = parseFloat(datosFactura.importe);
const subtotal = total / 1.16;
const iva = total - subtotal;


doc.setFontSize(8);
doc.text(`OBJETO IMPUESTO: 02 - Sí objeto de impuesto`, 10, tablaFinalY + 7);
doc.text(`IMPUESTOS TRASLADADOS: 002 - IVA Tasa 16.00 %`, 100, tablaFinalY + 7);
doc.text(`$${iva.toFixed(2)}`, 180, tablaFinalY + 7);

// Observaciones y totales
doc.text(`OBSERVACIONES: Folio ${datosFactura.folio}`, 10, tablaFinalY + 13);

// Cuadro de totales
doc.setFontSize(10);
doc.rect(140, tablaFinalY + 10, 60, 20);
doc.text(`SUBTOTAL:   $${subtotal.toFixed(2)}`, 145, tablaFinalY + 17);
doc.text(`IVA 16%:    $${iva.toFixed(2)}`, 145, tablaFinalY + 23);
doc.text(`TOTAL:      $${total.toFixed(2)}`, 145, tablaFinalY + 29);

// Pie de página
doc.setFontSize(7);
doc.text('Esta factura es una representación impresa de un CFDI.', 10, 285);

// Convertir a Blob como ya lo haces
const pdfBlob = doc.output('blob');

        // 2. Subir el PDF a Supabase Storage
        const nombreArchivo = `factura-${datosFactura.folio}-${Date.now()}.pdf`;

        console.log('Subiendo PDF a Supabase Storage...');
        const { data, error } = await supabase.storage
            .from('facturas')
            .upload(nombreArchivo, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true,
            });

        if (error) {
            throw new Error('No se pudo subir el PDF a Supabase: ' + error.message);
        }

    // 3. Obtener el link público del PDF
    const { data: urlData, error: urlError } = supabase.storage
        .from('facturas')
        .getPublicUrl(nombreArchivo);

    if (urlError) {
        throw new Error('No se pudo obtener el link público: ' + urlError.message);
    }
    const publicURL = urlData.publicUrl;
    console.log('PDF subido a Supabase. Link:', publicURL);

        // 4. Preparar parámetros para EmailJS
        const templateParams = {
            folio: datosFactura.folio,
            importe: datosFactura.importe,
            pdf_link: publicURL,
            email: datosFactura.correo
        };

        // 5. Enviar correo con EmailJS
        try {
            console.log('Intentando enviar correo...');
            const emailResponse = await emailjs.send(
                "service_judvxf2",
                "template_v0gxil4",
                templateParams
            );

            console.log('Respuesta EmailJS:', emailResponse);

            if (emailResponse.status === 200) {
                alert('✅ Factura generada y correo enviado correctamente');
            } else {
                alert('⚠️ Factura generada pero el correo puede no haberse enviado');
            }
        } catch (emailError) {
            console.error('Error detallado al enviar:', emailError);
            throw new Error(`El correo no pudo enviarse. Por favor contacta a soporte.`);
        }

    } catch (error) {
        console.error('Error en el proceso:', error);
        alert(`❌ Error: ${error.message}`);
    } finally {
        boton.textContent = textoOriginal;
        boton.disabled = false;
    }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
    if (window.emailjs) {
        try {
            emailjs.init("rs24peo_7HUFvvNTR");
            console.log('EmailJS inicializado');
        } catch (e) {
            console.error('Error inicializando EmailJS:', e);
        }
    } else {
        console.error('EmailJS no está disponible en window');
    }
});
window.enviarFactura = enviarFactura;
