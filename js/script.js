document.addEventListener('DOMContentLoaded', () => {
    // Animación de aparición de tarjetas
    const promoCards = document.querySelectorAll('.promo-card');
    promoCards.forEach((card, index) => {
        const delay = parseInt(card.dataset.delay) || 0;
        setTimeout(() => {
            card.classList.add('fade-in');
        }, delay);
    });

    // Cuenta regresiva para promociones (ejemplo)
    const countdownElements = document.querySelectorAll('.promo-countdown');

    countdownElements.forEach(countdownEl => {
        const endDateString = countdownEl.dataset.end;
        if (!endDateString) return;

        const endDate = new Date(endDateString).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                countdownEl.textContent = '¡Oferta Finalizada!';
                countdownEl.style.color = '#6c757d'; // Color gris para finalizado
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownEl.textContent = `Tiempo restante: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        // Actualizar cada segundo
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Llamar una vez al cargar para evitar el retraso inicial
    });
});