import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('login-form');

    if (formLogin) {
        formLogin.addEventListener('submit', loginConEmail);
    }
});

async function loginConEmail(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        mostrarPopup("Error", "Por favor completa ambos campos.");
        return;
    }

    console.log("Intentando iniciar sesión...");

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            mostrarPopup("Acceso denegado", "Correo o contraseña incorrectos.");
        } else {
            mostrarPopup("Error", error.message);
        }
        return;
    }

    console.log("✅ Sesión iniciada:", data);

    // Guardar ID de sesión
    sessionStorage.setItem('authId', data.user.id);
    sessionStorage.setItem('correoCliente', data.user.email);
    sessionStorage.setItem('sesionActiva', 'true');



    // Buscar nombre del usuario en tu tabla personalizada
    const { data: usuario, error: usuarioError } = await supabase
        .from('Usuarios')
        .select('nombre')
        .eq('auth_id', data.user.id)
        .single();

    if (usuario && usuario.nombre) {
        sessionStorage.setItem('nombreCliente', usuario.nombre);
    }
    sessionStorage.setItem('sesionActiva', 'true');
    const { data: yaExiste, error: errorExiste } = await supabase
        .from('Usuarios')
        .select('id')
        .eq('auth_id', data.user.id)
        .maybeSingle();

    if (!yaExiste && !errorExiste) {
        const { user_metadata } = data.user;

        const { error: insertError } = await supabase.from('Usuarios').insert([{
            auth_id: data.user.id,
            nombre: user_metadata?.nombres || '',
            correo: data.user.email,
            telefono: user_metadata?.telefono || '',
            fecha_nacimiento: null // o un valor predeterminado si lo tienes
        }]);

        if (insertError) {
            console.error("❌ Error al insertar en Usuarios:", insertError.message);
            mostrarPopup("Error", "No se pudo registrar información adicional.");
        } else {
            console.log("✅ Usuario insertado en tabla personalizada");
        }
    }

    mostrarPopup("Bienvenido", "Inicio de sesión exitoso.");
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);

}

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
export async function obtenerSesionActiva() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session.user;
}