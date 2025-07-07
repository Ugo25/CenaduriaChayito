// js/EliminarPerfil.js
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
    const botonEliminar = document.getElementById("eliminarPerfil");

    if (!botonEliminar) return;

    botonEliminar.addEventListener("click", async () => {
        const confirmar = confirm("¿Estás seguro de que deseas eliminar tu perfil fiscal? Esta acción no se puede deshacer.");

        if (!confirmar) return;

        const session = await supabase.auth.getSession();
        const user = session.data.session?.user;

        if (!user) {
            alert("Debes iniciar sesión para eliminar tu perfil.");
            return;
        }

        const { error } = await supabase
            .from("Perfil")
            .delete()
            .eq("Usuarios_id", user.id);

        if (error) {
            console.error("Error al eliminar el perfil:", error.message);
            alert("Hubo un error al intentar eliminar tu perfil.");
        } else {
            alert("Perfil eliminado correctamente.");
            window.location.href = "index.html"; // o donde desees redirigir
        }
    });
});
