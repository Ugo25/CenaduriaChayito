// js/Buscar.js
import { supabase } from './supabaseClient.js'; // Ya está inicializado en supabaseClient.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Buscar.js cargado y DOM listo ✅");

    const formBusqueda = document.getElementById('form-busqueda-facturas');
    const tipoBusquedaSelect = document.getElementById('tipoBusqueda');
    const valorBusquedaInput = document.getElementById('valorBusqueda');
    const listaFacturasDiv = document.getElementById('lista-facturas');
    const btnDescargarTodas = document.getElementById('btn-descargar-todas');

    // Referencias a los modales generales (para mensajes de error/info)
    const modalGeneralError = document.getElementById('modal-general-error');
    const modalGeneralMensaje = document.getElementById('modal-general-mensaje');
    const modalGeneralBoton = document.getElementById('modal-general-aceptar');

    // Función para mostrar el modal general
    function mostrarModalGeneral(mensaje) {
        if (modalGeneralError && modalGeneralMensaje && modalGeneralBoton) {
            modalGeneralMensaje.textContent = mensaje;
            modalGeneralError.classList.remove('oculto');
            document.body.classList.add('bloqueado');
        } else {
            console.error("Elementos del modal general no encontrados o faltantes.");
            alert(mensaje); // Fallback si el modal no se carga
        }
    }

    // Función para ocultar el modal general
    function ocultarModalGeneral() {
        if (modalGeneralError) {
            modalGeneralError.classList.add('oculto');
            document.body.classList.remove('bloqueado');
        }
    }

    // Event listener para el botón "Aceptar" del modal general
    if (modalGeneralBoton) {
        modalGeneralBoton.addEventListener('click', ocultarModalGeneral);
    }

    // Verificación de inicialización del cliente de Supabase
    if (!supabase) {
        console.error("El cliente de Supabase no está inicializado.");
        mostrarModalGeneral("No se pudo inicializar Supabase.");
        return;
    }
    let correoUsuario = null;

    // Obtener la sesión activa y el correo del usuario
    (async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            mostrarModalGeneral("No se pudo obtener la sesión del usuario.");
            return;
        }

        correoUsuario = sessionData.session.user.email;
        console.log("📧 Usuario autenticado:", correoUsuario);
    })();

    if (formBusqueda) {
        formBusqueda.addEventListener('submit', async (e) => {
            e.preventDefault();

            const tipoBusqueda = tipoBusquedaSelect.value;
            const valorBusqueda = valorBusquedaInput.value.trim();

            if (!valorBusqueda) {
                mostrarModalGeneral("Por favor, introduce un valor para la búsqueda.");
                return;
            }

            listaFacturasDiv.innerHTML = '<p>Buscando facturas...</p>'; // Mensaje de carga
            btnDescargarTodas.style.display = 'none';

            try {
                // Construcción de la consulta a la tabla 'Facturas' en Supabase
                let query = supabase.from('Facturas').select('*').eq('correo', correoUsuario);

                if (tipoBusqueda === 'folio') {
                    query = query.eq('folio', valorBusqueda).eq('correo', correoUsuario);
                } else if (tipoBusqueda === 'fecha') {
                    query = query.eq('created_at', valorBusqueda).eq('correo', correoUsuario);
                }

                // Ejecutamos la consulta
                const { data: facturas, error } = await query;

                console.log("Resultados de la consulta:", facturas); // Verifica los resultados

                if (error) {
                    console.error("Error al buscar facturas:", error.message);
                    mostrarModalGeneral("Error al buscar facturas. Por favor, inténtalo de nuevo.");
                    listaFacturasDiv.innerHTML = '<p>Error al cargar las facturas.</p>';
                    return;
                }

                if (facturas.length === 0) {
                    listaFacturasDiv.innerHTML = '<p>No se encontraron facturas con el criterio proporcionado.</p>';
                } else {
                    mostrarFacturas(facturas);
                }

            } catch (error) {
                console.error("Excepción al buscar facturas:", error);
                mostrarModalGeneral("Ha ocurrido un error inesperado al buscar facturas.");
                listaFacturasDiv.innerHTML = '<p>Ha ocurrido un error inesperado.</p>';
            }
        });
    }

    // Función para mostrar las facturas obtenidas
    function mostrarFacturas(facturas) {
        listaFacturasDiv.innerHTML = ''; // Limpiar resultados anteriores
        facturas.forEach(factura => {
            const facturaItem = document.createElement('div');
            facturaItem.classList.add('factura-item');
            facturaItem.innerHTML = `
                <div class="factura-info">
                    <p><strong>Folio:</strong> ${factura.folio || 'N/A'}</p>
                    <p><strong>Fecha:</strong> ${new Date(factura.created_at).toLocaleDateString() || 'N/A'}</p>
                    <p><strong>Total:</strong> $${(factura.total || 0).toFixed(2)}</p>
                    <p><strong>Usuario:</strong> ${factura.correo || 'Desconocido'}</p>
                </div>
                <div class="factura-actions">
                    <button class="descargar-pdf" data-url="${factura.pdf_url || ''}" ${!factura.pdf_url ? 'disabled' : ''}>Descargar PDF</button>
                </div>
            `;
            listaFacturasDiv.appendChild(facturaItem);

            // Añadir listeners a los botones de descarga
            facturaItem.querySelector('.descargar-pdf').addEventListener('click', (e) => {
                const url = e.target.dataset.url;
                if (url) window.open(url, '_blank');
                else mostrarModalGeneral("No se encontró el PDF para esta factura.");
            });
        });
    }

    if (btnDescargarTodas) {
        btnDescargarTodas.addEventListener('click', async () => {
            mostrarModalGeneral("La funcionalidad de descarga de ZIP está en desarrollo. ¡Pronto estará disponible!");
        });
    }
});
