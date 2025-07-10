// js/perfilDropdown.js
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("perfilDropdown cargado ✅");

    const perfilIcon = document.getElementById("perfil-icon");
    const menuPerfil = document.getElementById("menu-perfil");
    const opcionLogin = document.getElementById("opcion-login");
    const opcionPerfil = document.getElementById("opcion-perfil");
    const opcionCerrar = document.getElementById("opcion-cerrar");

    // ==============================================================
    // Variables de Popups (Actualizadas para coincidir con el HTML)
    // ==============================================================
    // Popup de salida/cierre de sesión
    const redirectPopupSalida = document.getElementById("redirect-popup-salida"); // NUEVO ID
    const redirectMensajeSalida = document.getElementById("redirect-popup-salida-mensaje"); // NUEVO ID
    // Ya no necesitamos 'redirectBotonAceptarSalida' si el popup se cierra automáticamente
    // const redirectBotonAceptarSalida = document.getElementById("redirect-popup-salida-aceptar"); // <--- ELIMINAR ESTA LÍNEA O COMENTARLA

    // Popup de error de redirección (para facturación sin sesión)
    const redirectPopupError = document.getElementById("redirect-popup-error"); // NUEVO ID
    const redirectMensajeError = document.getElementById("redirect-popup-mensaje"); // NUEVO ID
    const redirectBotonAceptarError = document.getElementById("redirect-popup-aceptar"); // NUEVO ID
    // ==============================================================

    function actualizarMenuPerfil() {
        const sesionActivaActual = sessionStorage.getItem("sesionActiva");
        console.log("Actualizando menú perfil. sesionActiva:", sesionActivaActual);

        if (sesionActivaActual === "true") {
            perfilIcon.src = "img/mounstro.png";
            opcionLogin.style.display = "none";
            opcionPerfil.style.display = "block";
            opcionCerrar.style.display = "block";
        } else {
            perfilIcon.src = "img/icono-perfil.png";
            opcionLogin.style.display = "block";
            opcionPerfil.style.display = "none";
            opcionCerrar.style.display = "none";
        }

        const linkFacturacion = document.getElementById("link-facturacion");
        if (linkFacturacion) {
            if (sesionActivaActual === "true") {
                linkFacturacion.setAttribute("href", "facturacion.html");
                console.log("Enlace de facturación establecido a facturacion.html");
            } else {
                linkFacturacion.removeAttribute("href"); // Quita el href para que JS lo maneje
                console.log("Enlace de facturación sin href (manejado por JS)");
            }
        }
    }

    actualizarMenuPerfil();

    perfilIcon.addEventListener("click", () => {
        menuPerfil.classList.toggle("mostrar");
    });

    opcionCerrar.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Clic en cerrar sesión.");

        sessionStorage.removeItem("sesionActiva");
        sessionStorage.removeItem("authId");
        sessionStorage.removeItem("correoCliente");
        sessionStorage.removeItem("nombreCliente");
        console.log("Datos de sesión eliminados.");

        await supabase.auth.signOut();
        console.log("Sesión de Supabase cerrada.");

        // --- INICIO DEL CÓDIGO CORREGIDO PARA EL POPUP DE SALIDA ---
        // Se asegura de que los elementos del popup existan antes de intentar manipularlos
        if (redirectPopupSalida && redirectMensajeSalida) {
            console.log("Elementos del popup de salida encontrados. Intentando mostrar...");
            redirectMensajeSalida.textContent = "Has cerrado sesión correctamente.";
            redirectPopupSalida.classList.remove("redirect-hidden"); // <--- AHORA SÍ SE HACE VISIBLE INMEDIATAMENTE
            document.body.classList.add('bloqueado'); // Para bloquear el scroll del body
            console.log("Mostrando popup de salida. Clase redirect-hidden removida.");

            const tiempoVisible = 2500; // 2.5 segundos

            setTimeout(() => {
                console.log("Ocultando popup de salida después del temporizador.");
                redirectPopupSalida.classList.add("redirect-hidden");
                document.body.classList.remove('bloqueado'); // Desbloquea el scroll

                // Usamos 'transitionend' para asegurar que la redirección ocurre después de la animación de ocultar
                redirectPopupSalida.addEventListener('transitionend', function handler(event) {
                    console.log("Evento 'transitionend' disparado para popup de salida después de ocultar. Propiedad:", event.propertyName);
                    if (event.propertyName === 'opacity' || event.propertyName === 'visibility') { // Asegura que la transición relevante terminó
                        console.log("Redirigiendo a index.html desde popup de salida después de ocultar...");
                        window.location.href = "index.html";
                        redirectPopupSalida.removeEventListener('transitionend', handler); // Importante para evitar múltiples ejecuciones
                    }
                }, { once: true }); // { once: true } asegura que el listener se elimine automáticamente después de dispararse una vez
            }, tiempoVisible); // <--- ¡Asegúrate de pasar el tiempo aquí!
        } else {
            console.error("Popup de salida no encontrado o elementos internos faltantes. Redirigiendo de inmediato.");
            window.location.href = "index.html"; // Redirige como fallback
        }
        // --- FIN DEL CÓDIGO CORREGIDO PARA EL POPUP DE SALIDA ---

        actualizarMenuPerfil();
    });

    // =================================================================
    // EL CÓDIGO PARA linkFacturacion ES CORRECTO Y NO NECESITA CAMBIOS AQUÍ
    // =================================================================
    const linkFacturacion = document.getElementById("link-facturacion");
    if (linkFacturacion) {
        linkFacturacion.addEventListener("click", (e) => {
            const sesionActivaEnClic = sessionStorage.getItem("sesionActiva");
            console.log("Clic en enlace de facturación. Estado de sesionActiva al momento del clic:", sesionActivaEnClic);

            if (sesionActivaEnClic !== "true") {
                e.preventDefault();
                console.log("Acceso a facturación denegado: Sesión no activa.");

                if (redirectPopupError && redirectBotonAceptarError && redirectMensajeError) {
                    console.log("Elementos del popup de error de facturación encontrados. Intentando mostrar...");
                    redirectMensajeError.textContent = "Debes iniciar sesión para acceder a facturación.";
                    redirectPopupError.classList.remove("redirect-hidden");
                    document.body.classList.add('bloqueado');
                    console.log("Mostrando popup de error de facturación. Clase redirect-hidden removida.");

                    redirectBotonAceptarError.onclick = () => {
                        console.log("Clic en Aceptar del popup de error. Intentando ocultar...");
                        redirectPopupError.classList.add("redirect-hidden");
                        document.body.classList.remove('bloqueado');
                        console.log("Ocultando popup de error. Clase redirect-hidden agregada.");

                        redirectPopupError.addEventListener('transitionend', function handler(event) {
                            console.log("Evento 'transitionend' disparado para popup de error. Propiedad:", event.propertyName);
                            if (event.propertyName === 'opacity' || event.propertyName === 'visibility') {
                                console.log("Redirigiendo al login desde popup de error...");
                                window.location.href = "login.html";
                                redirectPopupError.removeEventListener('transitionend', handler);
                            }
                        }, { once: true });
                    };
                } else {
                    console.error("ERROR: Uno o más elementos del popup de error de facturación no encontrados. Redirigiendo a login.");
                    window.location.href = "login.html";
                }
            } else {
                console.log("Sesión activa, permitiendo acceso a facturación. El href del enlace ya debería estar correcto.");
            }
        });
    }
});