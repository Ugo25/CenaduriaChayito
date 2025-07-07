// Frapida.js (script exclusivo para FacturaRapida.html)

import { supabase } from './supabaseClient.js';

window.supabase = supabase;

// Acceder a jsPDF desde window.jspdf
const { jsPDF } = window.jspdf;

// DOMContentLoaded principal
document.addEventListener('DOMContentLoaded', async () => {
    const btnGenerar = document.getElementById('btn-generar');
    const popupError = document.getElementById('popup-error');
    const popupMensaje = document.getElementById('popup-mensaje');
    const btnAceptarError = document.getElementById('popup-aceptar-error');
    const popupExito = document.getElementById('popup-exito');
    const popupMensajeExito = document.getElementById('popup-mensaje-exito');
    const btnAceptarExito = document.getElementById('popup-aceptar-exito');

    const sessionData = await supabase.auth.getSession();
    const session = sessionData?.data?.session;

    if (!session) {
        mostrarError("Debes iniciar sesión para generar una factura.");
        return;
    }

    const userId = session.user.id;
    const correoCliente = session.user.email;

    btnGenerar.addEventListener('click', async () => {
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = '<span class="spinner"></span> Generando...';

        const folio = document.getElementById('folio').value.trim();
        const importe = document.getElementById('importe').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!folio || !importe || !descripcion) {
            mostrarError("Todos los campos son obligatorios.");
            btnGenerar.disabled = false;
            btnGenerar.textContent = "Generar Factura";
            return;
        }

        const doc = new jsPDF();
        doc.autoTable({
            head: [['Folio', 'Importe', 'Descripción']],
            body: [[folio, `$${importe}`, descripcion]]
        });

        const pdfBlob = doc.output('blob');
        const nombreArchivo = `factura-${folio}-${Date.now()}.pdf`;
        const rutaArchivo = `${userId}/${nombreArchivo}`;

        try {
            const { error: uploadError } = await supabase
                .storage
                .from('facturas')
                .upload(rutaArchivo, pdfBlob, { contentType: 'application/pdf', upsert: true });

            if (uploadError) {
                console.error("Error al subir PDF:", uploadError);
                mostrarError("No se pudo subir el PDF.");
                return;
            }

            const { data: publicUrlData } = supabase.storage.from('facturas').getPublicUrl(rutaArchivo);
            const publicUrl = publicUrlData?.publicUrl;
            if (!publicUrl) {
                mostrarError("PDF subido, pero no se obtuvo la URL pública.");
                return;
            }

            const { error: insertError } = await supabase
                .from('Facturas')
                .insert([{
                    folio,
                    total: importe,
                    correo: correoCliente,
                    descripcion,
                    pdf_url: publicUrl,
                    fecha_cobro: new Date().toISOString()
                }]);

            if (insertError) {
                console.error("Error al insertar en la base de datos:", insertError);
                mostrarError("No se pudo guardar la factura en la base de datos.");
                return;
            }

            // Aquí ya no se envía correo. Solo se muestra éxito.
            mostrarExito("Factura generada y guardada correctamente. (Envío de correo delegado a factura.js)");

        } catch (error) {
            console.error("Error en el proceso de facturación:", error);
            mostrarError("Hubo un error inesperado.");
        } finally {
            btnGenerar.disabled = false;
            btnGenerar.textContent = "Generar Factura";
        }
    });

    function mostrarError(mensaje) {
        popupMensaje.textContent = mensaje;
        popupError.classList.remove('oculto');
        btnAceptarError.onclick = () => popupError.classList.add('oculto');
    }

    function mostrarExito(mensaje) {
        popupMensajeExito.textContent = mensaje;
        popupExito.classList.remove('oculto');
        btnAceptarExito.onclick = () => popupExito.classList.add('oculto');
    }
});
