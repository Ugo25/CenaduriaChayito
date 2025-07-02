let indiceSlide = 0;
const slides = document.querySelectorAll('.slide');
const puntos = document.querySelectorAll('.punto');
const intervalo = 5000;

function mostrarSlide(index) {
    slides.forEach(slide => slide.classList.remove('activo'));
    puntos.forEach(punto => punto.classList.remove('activo'));

    slides[index].classList.add('activo');
    puntos[index].classList.add('activo');
}

function cambiarSlide(direccion) {
    indiceSlide = (indiceSlide + direccion + slides.length) % slides.length;
    mostrarSlide(indiceSlide);
}

function irASlide(index) {
    indiceSlide = index;
    mostrarSlide(indiceSlide);
}

setInterval(() => {
    cambiarSlide(1);
}, intervalo);

// Mostrar el primero al cargar
mostrarSlide(indiceSlide);
