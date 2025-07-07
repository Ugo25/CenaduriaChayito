// redirigirFactura.js (este se usa en facturacion.html, no en FacturaRapida.html)
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return;
    }

    const userId = sessionData.session.user.id;

    const { data: perfil, error } = await supabase
        .from("Perfil")
        .select("id")
        .eq("usuarios_id", userId)
        .maybeSingle();

    if (perfil && !error) {
        window.location.href = "FacturaRapida.html";
    }
});
