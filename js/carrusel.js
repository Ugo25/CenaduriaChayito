
// ========= CARRUSEL DE SLIDES ==========

let indiceSlide = 0;
const slides = document.querySelectorAll('.slide');

function mostrarSlide(indice) {
    slides.forEach(slide => slide.classList.remove('activo'));
    indiceSlide = (indice + slides.length) % slides.length;
    slides[indiceSlide].classList.add('activo');
}

function cambiarSlide(direccion) {
    mostrarSlide(indiceSlide + direccion);
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarSlide(indiceSlide);
});

window.cambiarSlide = cambiarSlide;
