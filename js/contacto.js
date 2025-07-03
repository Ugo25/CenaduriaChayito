// contacto.js

import { supabase } from './supabaseClient.js';

// Inicializa EmailJS
emailjs.init("rs24peo_7HUFvvNTR"); // Tu Public Key

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script de EmailJS cargado ✅");

    const contactForm = document.getElementById("contact-form-custom");
    const modalGeneralError = document.getElementById('modal-general-error');
    const modalGeneralMensaje = document.getElementById('modal-general-mensaje');
    const modalGeneralBoton = document.getElementById('modal-general-aceptar');

    function mostrarModalGeneral(mensaje) {
        if (modalGeneralError && modalGeneralMensaje && modalGeneralBoton) {
            modalGeneralMensaje.textContent = mensaje;
            modalGeneralError.classList.remove('oculto');
            document.body.classList.add('bloqueado');
        } else {
            alert(mensaje);
        }
    }

    function ocultarModalGeneral() {
        if (modalGeneralError) {
            modalGeneralError.classList.add('oculto');
            document.body.classList.remove('bloqueado');
        }
    }

    if (modalGeneralBoton) {
        modalGeneralBoton.addEventListener('click', ocultarModalGeneral);
    }

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
            }

            let timeInput = contactForm.querySelector('input[name="time"]');
            if (!timeInput) {
                timeInput = document.createElement('input');
                timeInput.type = 'hidden';
                timeInput.name = 'time';
                contactForm.appendChild(timeInput);
            }

            const now = new Date();
            const formattedTime = new Intl.DateTimeFormat('es-MX', {
                timeZone: 'America/Mazatlan',
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(now);
            timeInput.value = formattedTime;

            emailjs.sendForm("service_jvib3i9", "template_zjgliyd", contactForm)
                .then(function () {
                    mostrarModalGeneral("¡Tu mensaje ha sido enviado con éxito! Nos pondremos en contacto contigo pronto.");

                    const formData = new FormData(contactForm);
                    const datos = {
                        user_name: formData.get("user_name"),
                        user_email: formData.get("user_email"),
                        phone_number: formData.get("phone_number"),
                        user_message: formData.get("user_message"),
                        sent_email_status: "SUCCESS",
                        setn_email_error: null
                    };

                    supabase.from("Contacto").insert([datos])
                        .then(({ error }) => {
                            if (error) {
                                console.error("❌ Error al guardar en Supabase", error);
                            } else {
                                console.log("✅ Datos guardados correctamente en Supabase");
                            }
                        });

                    contactForm.reset();
                })
                .catch(function (error) {
                    console.error("Error al enviar:", error);
                    mostrarModalGeneral("Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.");

                    const formData = new FormData(contactForm);
                    const datos = {
                        user_name: formData.get("user_name"),
                        user_email: formData.get("user_email"),
                        phone_number: formData.get("phone_number"),
                        user_message: formData.get("user_message"),
                        sent_email_status: "FAILED",
                        setn_email_error: error.text || "Error desconocido"
                    };

                    supabase.from("Contacto").insert([datos])
                        .then(({ error }) => {
                            if (error) {
                                console.error("❌ Error al guardar intento fallido en Supabase", error);
                            } else {
                                console.log("📥 Intento fallido también guardado");
                            }
                        });
                })
                .finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Enviar Mensaje';
                    }
                    if (timeInput && timeInput.parentNode) {
                        timeInput.parentNode.removeChild(timeInput);
                    }
                });
        });
    } else {
        console.error("No se encontró el formulario de contacto.");
        mostrarModalGeneral("Error interno: El formulario no se cargó correctamente.");
    }
});
