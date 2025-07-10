// js/GuardarPerfil.js
import { supabase } from './supabaseClient.js';

function mostrarPopup(titulo, mensaje) {
    const popup = document.createElement("div");
    popup.setAttribute("role", "alert");
    popup.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      color: black;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
      font-family: sans-serif;
      z-index: 9999;
    ">
      <strong>${titulo}</strong><br>
      <span>${mensaje}</span>
    </div>
  `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {

    const form = document.getElementById('perfilForm');
    const eliminarBtn = document.getElementById('eliminarPerfilBtn');
    const editarBtn = document.getElementById('editar-datos');
    const modalEliminar = document.getElementById('confirm-delete-modal');
    const btnConfirmYes = document.getElementById('confirm-delete-yes');
    const btnConfirmNo = document.getElementById('confirm-delete-no');

    let perfilActual = null;
    let editando = true;
    // Dentro de document.addEventListener('DOMContentLoaded', ...)
    const botonGuardar = document.querySelector('.save-button');
    botonGuardar.style.display = 'none';

    function hayCambios() {
        const actual = obtenerDatosFormulario();
        for (const clave in actual) {
            if (actual[clave] !== (perfilActual?.[clave] || '')) return true;
        }
        return false;
    }

    form.addEventListener('input', () => {
        if (editando && hayCambios()) {
            botonGuardar.style.display = 'inline-block';
        } else {
            botonGuardar.style.display = 'none';
        }
    });

    const mapeoColumnas = {
        razon_social: 'razonSocial',
        rfc: 'rfc',
        uso_cfdi: 'usoCfdi',
        regimen_fiscal: 'regimenFiscal',
        codigo_postal: 'codigoPostal',
        correo_facturacion: 'emailFacturacion',
        telefono: 'telefono'
    };

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
        console.warn("⚠️ Sesión inválida o usuario no existe");
        return;
    }

    const user = session.user;
    const userId = user.id;

    if (eliminarBtn) eliminarBtn.style.display = 'none';

    const { data, error } = await supabase
        .from('Perfil')
        .select('id, razon_social, rfc, uso_cfdi, regimen_fiscal, codigo_postal, correo_facturacion, telefono, usuarios_id') // <- explícito
        .eq('usuarios_id', userId);

    if (error && error.code !== 'PGRST116') {
        console.error("Error al cargar perfil:", error);
        mostrarPopup("Error", "Error al cargar el perfil.");
        return;
    }

    if (data && data.length > 0) {
        perfilActual = data[0];
        llenarFormulario(perfilActual);
        bloquearCampos();

        if (editarBtn) editarBtn.style.display = 'inline-block'; // ✅ Mostrar botón aquí
        if (eliminarBtn) eliminarBtn.style.display = 'inline-block';
    }


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validación de campos vacíos (excepto teléfono)
        const camposRequeridos = Object.entries(mapeoColumnas)
            .filter(([dbCol]) => dbCol !== 'telefono') // ← excluye teléfono
            .map(([_, id]) => id);

        let hayCamposVacios = false;

        camposRequeridos.forEach(id => {
            const input = document.getElementById(id);
            if (input && input.value.trim() === "") {
                input.style.border = "2px solid red";
                hayCamposVacios = true;
            } else if (input) {
                input.style.border = "";
            }
        });

        if (hayCamposVacios) {
            mostrarPopup("Campos incompletos", "Por favor llena todos los campos obligatorios.");
            return;
        }

        const nuevoPerfil = obtenerDatosFormulario();
        nuevoPerfil.usuarios_id = userId;

        // 1. Buscar si ya existe un perfil para este usuario
        const { data: existente, error: errorBuscar } = await supabase
            .from('Perfil')
            .select('id')
            .eq('correo_facturacion', nuevoPerfil.correo_facturacion) // o usa cualquier campo que identifique al usuario
            .maybeSingle();

        if (errorBuscar) {
            console.error("Error al buscar perfil:", errorBuscar);
            mostrarPopup("Error", "No se pudo verificar si ya existe un perfil.");
            return;
        }

        // 2. Elegir entre insert o update manualmente
        let respuesta;

        if (existente) {
            respuesta = await supabase
                .from('Perfil')
                .update(nuevoPerfil)
                .eq('id', existente.id);
        } else {
            respuesta = await supabase
                .from('Perfil')
                .insert([nuevoPerfil]);
        }

        if (respuesta.error) {
            console.error("Error al guardar perfil:", respuesta.error);
            mostrarPopup("Error", "No se pudo guardar el perfil.");
            return;
        }

        mostrarPopup("Éxito", "Perfil guardado correctamente.");

        // ACTUALIZA perfilActual con el ID correcto para evitar duplicados y mantener botones
        if (!perfilActual && respuesta.data?.length > 0) {
            perfilActual = { ...nuevoPerfil, id: respuesta.data[0].id };
        } else if (perfilActual) {
            perfilActual = { ...perfilActual, ...nuevoPerfil };
        }

        bloquearCampos();
        editarBtn.textContent = "Editar datos";
        editando = false;
        cancelarBtn.style.display = 'none';
        editarBtn.style.display = 'inline-block';
        botonGuardar.style.display = 'none';

        if (eliminarBtn) eliminarBtn.style.display = 'inline-block';
    });


    const cancelarBtn = document.getElementById('cancelar-edicion');

    if (editarBtn && cancelarBtn) {
        editarBtn.addEventListener('click', () => {
            editando = true;
            desbloquearCampos();
            editarBtn.style.display = 'none';
            cancelarBtn.style.display = 'inline-block';
            botonGuardar.style.display = 'none'; // se mostrará solo si hay cambios
        });

        cancelarBtn.addEventListener('click', () => {
            llenarFormulario(perfilActual);
            bloquearCampos();
            cancelarBtn.style.display = 'none';
            editarBtn.style.display = 'inline-block';

            if (eliminarBtn && perfilActual) eliminarBtn.style.display = 'inline-block';
        });
    }

    if (eliminarBtn) {
        eliminarBtn.addEventListener('click', () => {
            // NO ocultamos el botón aquí aún
            modalEliminar.classList.remove('oculto');
        });
    }


    const { data: usuarioData, error: errorUsuario } = await supabase
        .from('Usuarios')
        .select('correo, telefono')
        .eq('auth_id', userId)
        .maybeSingle();

    if (!errorUsuario && usuarioData) {
        const campoCorreo = document.getElementById('emailFacturacion');
        const campoTelefono = document.getElementById('telefono');

        if (!perfilActual) {
            if (campoCorreo && !campoCorreo.value) campoCorreo.value = usuarioData.correo;
            if (campoTelefono && !campoTelefono.value) campoTelefono.value = usuarioData.telefono;
        }
    }

    btnConfirmYes.addEventListener('click', async () => {
        const { error } = await supabase.from('Perfil').delete().eq('usuarios_id', userId);

        if (error) {
            mostrarPopup("Error", "Error al eliminar el perfil: " + error.message);
        } else {
            mostrarPopup("Perfil eliminado", "Perfil eliminado correctamente.");
            form.reset();
            desbloquearCampos();
            perfilActual = null;
            editando = true; // ✅ Permitir mostrar botón de guardar si hay cambios
            if (eliminarBtn) eliminarBtn.style.display = 'none';
            if (editarBtn) editarBtn.style.display = 'none';
        }
        modalEliminar.classList.add('oculto');
    });



    btnConfirmNo.addEventListener('click', () => {
        modalEliminar.classList.add('oculto');
    });

    function llenarFormulario(perfil) {
        if (!perfil) return; // ✅ Previene error si perfil es null

        for (const dbCol in mapeoColumnas) {
            const inputId = mapeoColumnas[dbCol];
            const campo = document.getElementById(inputId);
            if (campo && perfil[dbCol] !== undefined) {
                campo.value = perfil[dbCol];
            }
        }
    }


    function obtenerDatosFormulario() {
        const datos = {};
        for (const dbCol in mapeoColumnas) {
            const inputId = mapeoColumnas[dbCol];
            const campo = document.getElementById(inputId);
            datos[dbCol] = campo ? campo.value : '';
        }
        return datos;
    }

    function bloquearCampos() {
        for (const id of Object.values(mapeoColumnas)) {
            const campo = document.getElementById(id);
            if (campo) {
                campo.readOnly = true;
                campo.classList.add('bloqueado');
            }
        }
    }

    function desbloquearCampos() {
        for (const id of Object.values(mapeoColumnas)) {
            const campo = document.getElementById(id);
            if (campo) {
                campo.readOnly = false;
                campo.classList.remove('bloqueado');
            }
        }
    }
});
