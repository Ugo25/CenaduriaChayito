
import { supabase } from './supabaseClient.js';

window.supabase = supabase;

// Función para mostrar el popup de error
function mostrarPopupError(mensaje) {
    const popup = document.getElementById("popup-error");
    const mensajeElemento = document.getElementById("popup-mensaje");
    const botonAceptar = document.getElementById("popup-aceptar-error");

    if (popup && mensajeElemento && botonAceptar) {
        mensajeElemento.textContent = mensaje;
        popup.classList.remove("oculto");
        botonAceptar.onclick = () => {
            popup.classList.add("oculto");
        };
    } else {
        console.warn("⚠️ No se encontró el popup de error o alguno de sus elementos.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Verificando sesión...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        mostrarPopupError('Error al inicializar la sesión.');
        return;
    } else if (!session) {
        window.location.href = 'login.html';
        return;
    }
    console.log('✅ Sesión activa al cargar la página:', session);
    const nombreCliente = sessionStorage.getItem('nombreCliente');
    const correoCliente = sessionStorage.getItem('correoCliente');
    const h3Bienvenida = document.getElementById('bienvenida-cliente');

    if (nombreCliente && h3Bienvenida) {
        h3Bienvenida.textContent = `¡Bienvenido ${nombreCliente}!`;
    } else if (correoCliente && h3Bienvenida) {
        h3Bienvenida.textContent = `¡Bienvenido ${correoCliente}!`;
    } else if (h3Bienvenida) {
        h3Bienvenida.textContent = '¡Bienvenido!';
    }

    const btnGenerar = document.getElementById("btn-generar");
    const btnBuscar = document.getElementById("btn-azul");

    if (btnGenerar) {
        btnGenerar.addEventListener("click", enviarFactura);
    }
    if (btnBuscar) {
        btnBuscar.addEventListener("click", buscarFactura);
    }

    // Obtener y rellenar el perfil fiscal
    const { data: perfil, error: perfilError } = await supabase
        .from('Perfil')
        .select('razon_social, rfc, uso_cfdi, regimen_fiscal, codigo_postal, correo_facturacion, telefono')
        .eq('usuarios_id', session.user.id);


    if (perfilError) {
        console.warn("❌ No se pudo obtener el perfil fiscal:", perfilError.message);
    } else if (perfil && perfil.length > 0) {
        const campos = {
            razon: perfil[0].razon_social ?? '',
            rfc: perfil[0].rfc ?? '',
            uso: perfil[0].uso_cfdi ?? '',
            regimen: perfil[0].regimen_fiscal ?? '',
            cp: perfil[0].codigo_postal ?? '',
            correo: perfil[0].correo_facturacion ?? '',
            telefono: perfil[0].telefono ?? ''
        };

        for (const id in campos) {
            const input = document.getElementById(id);
            if (input) {
                input.value = campos[id];
                if (input.tagName === 'SELECT') {
                    input.disabled = true;
                } else {
                    input.readOnly = true;
                }
                input.classList.add('bloqueado');
            }
        }
    }
    else {
        console.log("⚠️ No hay perfil registrado para este usuario.");
        // Opcional: aquí podrías mostrar un mensaje visible
    }
});

emailjs.init("rs24peo_7HUFvvNTR");

async function enviarFactura() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        mostrarPopupError('⚠️ Sesión inválida. Inicia sesión de nuevo.');
        return;
    }

    const currentUserId = userData.user.id;
    const boton = document.querySelector('.btn-verde');
    const textoOriginal = boton.textContent;

    try {
        boton.innerHTML = '<span class="spinner"></span> Procesando...';
        boton.disabled = true;

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

        datosFactura.cp = document.getElementById("cp").value;
        datosFactura.regimen = document.getElementById("regimen").value;
        datosFactura.uso = document.getElementById("uso").value;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFillColor(128, 0, 0);
        doc.rect(0, 0, 210, 10, "F");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('CFDI VERSIÓN 4.0', 10, 7);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(`SERIE Y FOLIO: *****`, 170, 7);
        doc.text(`NO. DE SERIE DEL CERTIFICADO DEL EMISOR: 00001000000707060420`, 10, 14);
        doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleString('es-MX')}`, 10, 18);
        doc.setFontSize(9);
        doc.text('EMISOR:', 10, 26);
        doc.text('Empresa de Prueba S.A. de C.V.', 10, 30);
        doc.text('RFC: DEMO010203XYZ', 10, 34);
        doc.text(`Régimen Fiscal: ${datosFactura.regimen || "601 - General de Ley Personas Morales"}`, 10, 38);
        doc.text('RECEPTOR:', 110, 26);
        doc.text(`Razón Social: ${datosFactura.razon}`, 110, 30);
        doc.text(`RFC: ${datosFactura.rfc}`, 110, 34);
        doc.text(`Correo: ${datosFactura.correo}`, 110, 38);
        doc.text(`CP: ${datosFactura.cp || "00000"}`, 110, 42);
        doc.text(`Régimen: ${datosFactura.regimen || "-"}`, 110, 46);
        doc.text(`Uso CFDI: ${datosFactura.uso || "-"}`, 110, 50);

        doc.setFontSize(8);
        doc.rect(10, 52, 190, 12);
        doc.text(`LUGAR EXPEDICIÓN: ${datosFactura.cp || "00000"}`, 12, 58);
        doc.text(`TIPO COMPROBANTE: I - Ingreso`, 70, 58);
        doc.text(`MONEDA: MXN`, 120, 58);
        doc.text(`MÉTODO DE PAGO: PUE`, 12, 62);
        doc.text(`FORMA DE PAGO: 01 - Efectivo`, 70, 62);

        const conceptos = [[
            '90101501', 'E48', '1.00', '001', datosFactura.descripcion || 'Concepto facturado',
            `$${parseFloat(datosFactura.importe).toFixed(2)}`, '$0.00', `$${parseFloat(datosFactura.importe).toFixed(2)}`
        ]];

        doc.autoTable({
            head: [['CLAVE', 'UNIDAD', 'CANT', 'NO. ID', 'DESCRIPCIÓN', 'VALOR UNITARIO', 'DESC', 'IMPORTE']],
            body: conceptos,
            startY: 66,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 1, halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [200, 200, 200] },
            columnStyles: { 4: { halign: 'left', cellWidth: 50 }, 5: { halign: 'right' }, 7: { halign: 'right' } }
        });

        const total = parseFloat(datosFactura.importe);
        const subtotal = total / 1.16;
        const iva = total - subtotal;
        const tablaFinalY = doc.lastAutoTable.finalY || 75;

        doc.setFontSize(8);
        doc.text(`OBJETO IMPUESTO: 02 - Sí objeto de impuesto`, 10, tablaFinalY + 7);
        doc.text(`IMPUESTOS TRASLADADOS: 002 - IVA Tasa 16.00 %`, 100, tablaFinalY + 7);
        doc.text(`$${iva.toFixed(2)}`, 180, tablaFinalY + 7);
        doc.text(`OBSERVACIONES: Folio ${datosFactura.folio}`, 10, tablaFinalY + 13);

        doc.setFontSize(10);
        doc.rect(140, tablaFinalY + 10, 60, 20);
        doc.text(`SUBTOTAL:   $${subtotal.toFixed(2)}`, 145, tablaFinalY + 17);
        doc.text(`IVA 16%:    $${iva.toFixed(2)}`, 145, tablaFinalY + 23);
        doc.text(`TOTAL:      $${total.toFixed(2)}`, 145, tablaFinalY + 29);
        doc.setFontSize(7);
        doc.text('Esta factura es una representación impresa de un CFDI.', 10, 285);

        const pdfBlob = await doc.output('blob');
        const nombreArchivo = `factura-${datosFactura.folio}-${Date.now()}.pdf`;
        const rutaArchivo = `${currentUserId}/${nombreArchivo}`;

        const { error: uploadError } = await supabase
            .storage
            .from('facturas')
            .upload(rutaArchivo, pdfBlob, { contentType: 'application/pdf', upsert: true });
        if (uploadError) return mostrarPopupError('❌ No se pudo subir el PDF.');

        const { data: publicUrlData } = supabase.storage.from('facturas').getPublicUrl(rutaArchivo);
        const publicUrl = publicUrlData?.publicUrl;
        if (!publicUrl) return mostrarPopupError('⚠️ PDF subido, pero no se obtuvo la URL pública.');

        const { error: insertError } = await supabase
            .from('Facturas')
            .insert([{
                folio: datosFactura.folio, razon_social: datosFactura.razon, rfc: datosFactura.rfc,
                correo: datosFactura.correo, total: datosFactura.importe, pdf_url: publicUrl,
                fecha_cobro: new Date().toISOString(), regimen_fiscal: datosFactura.regimen
            }]);
        if (insertError) return mostrarPopupError('❌ No se pudo guardar la factura en la base de datos.');

        const templateParams = {
            folio: datosFactura.folio, importe: datosFactura.importe, pdf_link: publicUrl, email: datosFactura.correo
        };

        const emailResponse = await emailjs.send("service_judvxf2", "template_v0gxil4", templateParams);
        if (emailResponse.status === 200) {
            mostrarPopupExito('✅ Factura generada, guardada y correo enviado correctamente');

        } else {
            mostrarPopupError('⚠️ Factura generada, pero el correo podría no haberse enviado.');
        }
    } catch (error) {
        mostrarPopupError("❌ Error: " + error.message);
    } finally {
        boton.textContent = textoOriginal;
        boton.disabled = false;
    }
}

async function buscarFactura() {
    const folio = document.getElementById('folio').value.trim();
    if (!folio) return mostrarPopupError("⚠️ Por favor ingresa un folio.");
    try {
        const { data, error } = await supabase.from('Facturas').select('*').eq('folio', folio);
        if (error || !data.length) return mostrarPopupError("⚠️ No se encontró ninguna factura con ese folio.");
        const factura = data[0];
        alert(`Factura encontrada: 
    Folio: ${factura.folio}
    Importe: ${factura.total}
    Correo: ${factura.correo}`);
    } catch (error) {
        mostrarPopupError("❌ Hubo un problema al buscar la factura.");
    }
}
function mostrarPopupExito(mensaje) {
    const popup = document.getElementById("popup-exito");
    const mensajeElemento = document.getElementById("popup-mensaje-exito");
    const botonAceptar = document.getElementById("popup-aceptar-exito");

    if (popup && mensajeElemento && botonAceptar) {
        mensajeElemento.textContent = mensaje;
        popup.classList.remove("oculto");
        botonAceptar.onclick = () => {
            popup.classList.add("oculto");
        };
    } else {
        console.warn("⚠️ No se encontró el popup de éxito o alguno de sus elementos.");
    }
}

window.enviarFactura = enviarFactura;
window.buscarFactura = buscarFactura;
