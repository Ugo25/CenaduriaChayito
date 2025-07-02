// js/perfilDropdown.js

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
    const redirectBotonAceptarSalida = document.getElementById("redirect-popup-salida-aceptar"); // NUEVO ID

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

        if (window.supabase) {
            await window.supabase.auth.signOut();
            console.log("Sesión de Supabase cerrada.");
        }

        if (redirectPopupSalida && redirectBotonAceptarSalida && redirectMensajeSalida) {
            console.log("Elementos del popup de salida encontrados. Intentando mostrar...");
            redirectMensajeSalida.textContent = "Has cerrado sesión correctamente.";
            redirectPopupSalida.classList.remove("redirect-hidden");
            document.body.classList.add('bloqueado');
            console.log("Mostrando popup de salida. Clase redirect-hidden removida.");

            redirectBotonAceptarSalida.onclick = () => {
                console.log("Clic en Aceptar del popup de salida. Intentando ocultar...");
                redirectPopupSalida.classList.add("redirect-hidden");
                document.body.classList.remove('bloqueado');
                console.log("Ocultando popup de salida. Clase redirect-hidden agregada.");

                redirectPopupSalida.addEventListener('transitionend', function handler(event) {
                    console.log("Evento 'transitionend' disparado para popup de salida. Propiedad:", event.propertyName);
                    if (event.propertyName === 'opacity') {
                        console.log("Redirigiendo a index.html desde popup de salida...");
                        window.location.href = "index.html";
                        redirectPopupSalida.removeEventListener('transitionend', handler);
                    }
                }, { once: true });
            };
        } else {
            console.error("Popup de salida no encontrado o elementos internos faltantes, redirigiendo de inmediato.");
            window.location.href = "index.html";
        }
        actualizarMenuPerfil();
    });

    const linkFacturacion = document.getElementById("link-facturacion");
    if (linkFacturacion) {
        linkFacturacion.addEventListener("click", (e) => {
            const sesionActivaEnClic = sessionStorage.getItem("sesionActiva");
            console.log("Clic en enlace de facturación. Estado de sesionActiva al momento del clic:", sesionActivaEnClic);

            if (sesionActivaEnClic !== "true") {
                e.preventDefault();
                console.log("Acceso a facturación denegado: Sesión no activa.");

                // Aquí ya no necesitamos redeclarar 'popup', 'aceptar', 'textoPopup'
                // Ya tenemos las variables globales 'redirectPopupError', 'redirectBotonAceptarError', 'redirectMensajeError'

                if (redirectPopupError && redirectBotonAceptarError && redirectMensajeError) { // Usar las variables globales
                    console.log("Elementos del popup de error de facturación encontrados. Intentando mostrar...");
                    redirectMensajeError.textContent = "Debes iniciar sesión para acceder a facturación."; // Usar la variable global
                    redirectPopupError.classList.remove("redirect-hidden"); // Usar la variable global
                    document.body.classList.add('bloqueado');
                    console.log("Mostrando popup de error de facturación. Clase redirect-hidden removida.");

                    redirectBotonAceptarError.onclick = () => { // Usar la variable global
                        console.log("Clic en Aceptar del popup de error. Intentando ocultar...");
                        redirectPopupError.classList.add("redirect-hidden"); // Usar la variable global
                        document.body.classList.remove('bloqueado');
                        console.log("Ocultando popup de error. Clase redirect-hidden agregada.");

                        redirectPopupError.addEventListener('transitionend', function handler(event) { // Usar la variable global
                            console.log("Evento 'transitionend' disparado para popup de error. Propiedad:", event.propertyName);
                            if (event.propertyName === 'opacity') {
                                console.log("Redirigiendo al login desde popup de error...");
                                window.location.href = "login.html";
                                redirectPopupError.removeEventListener('transitionend', handler); // Usar la variable global
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
