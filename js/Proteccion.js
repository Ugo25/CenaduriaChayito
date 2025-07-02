// proteccion.js
document.addEventListener('DOMContentLoaded', () => {
    // Simulamos que el usuario está autenticado con una variable de sesión
    const usuarioAutenticado = sessionStorage.getItem('usuarioAutenticado');

    const contenido = document.getElementById('contenido');
    const mensajeNoAutenticado = document.getElementById('mensaje-no-autenticado');

    if (usuarioAutenticado) {
        // Si el usuario está autenticado, mostramos el contenido
        contenido.style.display = 'block';
        mensajeNoAutenticado.style.display = 'none';
    } else {
        // Si el usuario no está autenticado, mostramos el mensaje de error
        contenido.style.display = 'none';
        mensajeNoAutenticado.style.display = 'block';

        // Redirigimos al login (si lo deseas)
        // setTimeout(() => {
        //     window.location.href = 'login.html';
        // }, 3000); // Opcional: redirige después de 3 segundos
    }
});
