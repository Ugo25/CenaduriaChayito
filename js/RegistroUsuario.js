
import { supabase } from './supabaseClient.js';

const form = document.getElementById('registro-form');

function mostrarPopup(titulo, mensaje) {
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "30px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.background = "#fff";
    popup.style.color = "#000";
    popup.style.padding = "18px 22px";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
    popup.style.zIndex = "9999";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    popup.style.fontFamily = "Segoe UI, sans-serif";
    popup.style.textAlign = "center";
    popup.style.maxWidth = "400px";

    popup.innerHTML = `<strong style="font-size:18px;">${titulo}</strong><br><p style="margin-top:6px;">${mensaje}</p>`;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
        popup.style.opacity = "0";
        popup.style.transform = "translateX(-50%) translateY(-20px)";
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

["nombres", "correo", "telefono", "password"].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
        input.style.border = "";
    });
});
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombres = document.getElementById('nombres');
    const email = document.getElementById('correo');
    const telefono = document.getElementById('telefono');
    const password = document.getElementById('password');


    let errorCampos = [];

    if (nombres.value.trim() === "") {
        nombres.style.border = "2px solid red";
        errorCampos.push("Nombres");
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoValido.test(email.value.trim())) {
        email.style.border = "2px solid red";
        errorCampos.push("Correo válido");
    }

    if (!/^\d{10}$/.test(telefono.value.trim())) {
        telefono.style.border = "2px solid red";
        errorCampos.push("Teléfono (10 dígitos)");
    }

    if (password.value.trim() === "") {
        password.style.border = "2px solid red";
        errorCampos.push("Contraseña");
    }

    if (errorCampos.length > 0) {
        mostrarPopup("Campos incompletos", "Corrige: " + errorCampos.join(", "));
        return;
    }
    const fNacimiento = document.getElementById('fNacimiento').value;
    if (!fNacimiento) {
        mostrarPopup("Fecha requerida", "Por favor ingresa tu fecha de nacimiento.");
        return;
    }

    const edad = calcularEdad(fNacimiento);
    if (edad < 18) {
        mostrarPopup("Edad mínima requerida", "Debes tener al menos 18 años para registrarte.");
        return;
    }

    // 🔍 Verificar si el correo ya está registrado
    const { data: existente, error: errorBusqueda } = await supabase // <-- Cambiado de 'client' a 'supabase'
        .from("Usuarios")
        .select("correo")
        .eq("correo", email.value.trim())
        .maybeSingle();

    if (errorBusqueda) {
        mostrarPopup("Error", "No se pudo verificar el correo.");
        return;
    }

    if (existente) {
        email.style.border = "2px solid red";
        mostrarPopup("Correo duplicado", "Este correo ya está registrado.");
        return;
    }

    // ✅ Crear cuenta en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
            data: {
                nombres: nombres.value.trim(),
                telefono: telefono.value.trim()
            }
        }
    });

    if (authError) {
        mostrarPopup("Error al registrarse", authError.message);
        return;
    }

    mostrarPopup("¡Registro exitoso!", "Redirijiendo...");
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 3000);


});


