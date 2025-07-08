import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) return;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data || !data.user) return;

        // Validar usuario en tabla personalizada
        const { data: usuario, error: usuarioError } = await supabase
            .from('Usuarios')
            .select('nombre')
            .eq('auth_id', data.user.id);

        if (usuarioError || !usuario || usuario.length === 0) return;

        // ✅ Guardar en sessionStorage
        sessionStorage.setItem('authId', data.user.id);
        sessionStorage.setItem('nombreCliente', usuario[0].nombre || '');
        sessionStorage.setItem('correoCliente', data.user.email || '');
        sessionStorage.setItem('sesionActiva', 'true');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

});
