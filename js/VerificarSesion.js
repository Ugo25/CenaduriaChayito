document.addEventListener("DOMContentLoaded", () => {
    const sesionActiva = sessionStorage.getItem("sesionActiva");
    const enlaceFacturacion = document.querySelector('a[href="facturacion.html"]');
    const botonCerrarSesion = document.getElementById("cerrar-sesion");

    // Verifica si la sesión está activa
    if (sesionActiva === "true") {
        // Si la sesión está activa, cambiar el enlace de facturación a facturacion.html
        if (enlaceFacturacion) {
            enlaceFacturacion.setAttribute("href", "index.html");
        }

        // Mostrar el botón de cerrar sesión
        if (botonCerrarSesion) {
            botonCerrarSesion.style.display = "inline-block";
        }
    } else {
        // Si la sesión no está activa, mantener el enlace en login.html
        if (enlaceFacturacion) {
            enlaceFacturacion.setAttribute("href", "login.html");
        }
    }

    // Si el botón de cerrar sesión está disponible, añadir el evento de clic
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", async () => {
            // Limpiar los datos de la sesión
            sessionStorage.removeItem("sesionActiva");
            sessionStorage.removeItem("authId");
            sessionStorage.removeItem("correoCliente");
            sessionStorage.removeItem("nombreCliente");

            // Si estás usando supabase global, cerrar sesión con Supabase
            if (window.supabase) {
                await supabase.auth.signOut();
            }

            // Muestra el popup de confirmación de cierre de sesión
            const popupSalida = document.getElementById("popup-salida");
            const popupMensaje = document.getElementById("popup-salida-mensaje");
            const popupAceptar = document.getElementById("popup-salida-aceptar");

            if (popupSalida && popupAceptar && popupMensaje) {
                popupMensaje.textContent = "Has cerrado sesión.";
                popupSalida.classList.remove("oculto"); // Mostrar popup
                document.body.classList.add("bloqueado"); // Bloquear el fondo

                // Redirige al usuario después de que el popup se cierre
                popupAceptar.onclick = () => {
                    popupSalida.classList.add("oculto"); // Ocultar popup
                    document.body.classList.remove("bloqueado"); // Desbloquear fondo
                    window.location.href = "index.html"; // Redirige a la página principal
                };
            }
        });
    }

    // Asegurarse de que no se redirija al usuario a facturación si no está logueado
    if (enlaceFacturacion) {
        enlaceFacturacion.addEventListener("click", (e) => {
            if (sesionActiva !== "true") {
                e.preventDefault(); // Previene la redirección si la sesión no está activa

                // Mostrar el popup de error
                const popupError = document.getElementById("popup-error");
                const popupAceptarError = document.getElementById("popup-aceptar-error");
                const textoPopupError = document.getElementById("popup-mensaje");

                if (popupError && popupAceptarError && textoPopupError) {
                    textoPopupError.textContent = "Debes iniciar sesión para acceder a facturación.";
                    popupError.classList.remove("oculto"); // Mostrar popup
                    document.body.classList.add("bloqueado"); // Bloquear fondo

                    // Redirige al usuario después de que cierre el popup de error
                    popupAceptarError.onclick = () => {
                        popupError.classList.add("oculto"); // Ocultar popup
                        document.body.classList.remove("bloqueado"); // Desbloquear fondo
                        window.location.href = "login.html"; // Redirige a login.html
                    };
                }
            }
        });
    }
});


