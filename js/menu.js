// Mostrar/ocultar el menú de usuario al hacer clic en el icono de perfil
document.getElementById('perfil-icon').addEventListener('click', function (e) {
    e.preventDefault();
    const menuUsuario = document.getElementById('menu-usuario');
    menuUsuario.classList.toggle('active'); // Alterna la clase 'active' para mostrar/ocultar el menú
});

// Funcionalidad para cerrar sesión
document.getElementById('cerrar-sesion').addEventListener('click', function () {
    // Elimina los datos de la sesión
    sessionStorage.removeItem('authId');
    sessionStorage.removeItem('nombreCliente');
    window.location.href = 'login.html'; // Redirige al login
});

// Opcional: Configuración
document.getElementById('configuracion').addEventListener('click', function () {
    alert("Configuración: Aquí puedes ajustar tus preferencias.");
});
