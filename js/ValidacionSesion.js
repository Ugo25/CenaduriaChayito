// === supabaseClient.js ===
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


// === ValidacionSesion.js ===
document.addEventListener('DOMContentLoaded', () => {
    const bienvenida = document.getElementById("bienvenida-cliente");
    const nombreCliente = sessionStorage.getItem("nombreCliente");
    if (bienvenida && nombreCliente) {
        bienvenida.textContent = `¡Bienvenido, ${nombreCliente}!`;
    }

    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            mostrarPopup("Error", "Por favor completa ambos campos.");
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                mostrarPopup("Error de acceso", "El correo o la contraseña no son correctos.");
            } else {
                mostrarPopup("Error de acceso", error.message);
            }
        } else {
            sessionStorage.setItem('authId', data.user.id);

            const { data: usuario, error: usuarioError } = await supabase
                .from('Usuarios')
                .select('nombre')
                .eq('auth_id', data.user.id)
                .single();

            if (usuario && usuario.nombre) {
                sessionStorage.setItem('nombreCliente', usuario.nombre);
            }
            sessionStorage.setItem('sesionActiva', 'true');

            mostrarPopup("Bienvenido", "Inicio de sesión exitoso.");
            setTimeout(() => {
                window.location.href = 'facturacion.html';
            }, 1000);
        }
    });
});

function mostrarPopup(titulo, mensaje) {
    const popup = document.createElement("div");
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