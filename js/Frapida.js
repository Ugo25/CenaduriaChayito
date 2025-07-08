// Frapida.js — genera factura completa con datos del perfil

import { supabase } from './supabaseClient.js';
import { enviarFactura } from './factura.js';

window.supabase = supabase;

// DOM principal

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

    btnGenerar.addEventListener('click', async (e) => {
        e.preventDefault();
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = '<span class="spinner"></span> Generando...';

        const folio = document.getElementById('folio').value.trim();
        const importe = document.getElementById('importe').value.trim();
        const metodo_pago = document.getElementById('metodo_pago').value.trim();
        const CF = document.getElementById('CF').value.trim();
        const sucursal = document.getElementById('Sucursal').value.trim();

        if (!folio || !importe || !metodo_pago || !CF || !sucursal) {
            mostrarError("Todos los campos son obligatorios.");
            resetBoton();
            return;
        }

        try {
            // Traer datos del perfil guardado
            const { data: perfil, error: perfilError } = await supabase
                .from('Perfil')
                .select('*')
                .eq('auth_id', userId)
                .single();

            if (perfilError || !perfil) {
                mostrarError("Error: El campo razon es requerido y no se encontró.");
                resetBoton();
                return;
            }

            // Guardar datos combinados en sessionStorage para que factura.js lo procese
            sessionStorage.setItem("facturaReciente", JSON.stringify({
                folio,
                importe,
                metodo_pago,
                CF,
                sucursal,
                correo: correoCliente,
                perfil // todos los datos del perfil fiscal
            }));

            // Usar la función de factura.js para generar y enviar
            await enviarFactura();
            mostrarExito("El correo con la factura fue enviado automáticamente.");

        } catch (err) {
            console.error("Error inesperado:", err);
            mostrarError("Hubo un error al generar la factura.");
        }

        resetBoton();
    });

    function resetBoton() {
        btnGenerar.disabled = false;
        btnGenerar.textContent = "Generar Factura";
    }

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
