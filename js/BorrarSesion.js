import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnEliminar = document.getElementById('eliminar-cuenta-btn');
    const popupConfirm = document.getElementById('popup-confirm');
    const btnConfirmar = document.getElementById('confirmar-eliminar');
    const btnCancelar = document.getElementById('cancelar-eliminar');

    function mostrarPopup(titulo, mensaje, redirigir = false) {
        const popup = document.createElement("div");
        popup.className = "popup-mensaje";
        popup.innerHTML = `
            <strong>${titulo}</strong><br>
            <span>${mensaje}</span>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
            if (redirigir) window.location.href = "index.html";
        }, 3000);
    }

    btnEliminar?.addEventListener('click', () => {
        popupConfirm.classList.remove('oculto');
    });

    btnCancelar?.addEventListener('click', () => {
        popupConfirm.classList.add('oculto');
    });

    btnConfirmar?.addEventListener('click', async () => {
        popupConfirm.classList.add('oculto');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            mostrarPopup("Error", "No hay sesión activa.");
            return;
        }

        const { error } = await supabase.rpc('eliminar_completamente_cuenta');

        if (error) {
            console.error('❌ Error al eliminar cuenta:', error.message);
            mostrarPopup("Error", "No se pudo eliminar tu cuenta.");
        } else {
            await supabase.auth.signOut();
            sessionStorage.clear();
            mostrarPopup("Cuenta eliminada", "Tu cuenta ha sido eliminada correctamente.", true);
        }
    });
});
