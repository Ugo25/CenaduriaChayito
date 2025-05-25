// ========= PANTALLA DE CARGA (loader) ==========

// Ocultar la pantalla de carga después de un "falso" retardo al cargar la página
window.addEventListener("load", function () {
    const loader = document.getElementById("pantalla-carga");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.5s ease"; // transición más rápida y fluida

            setTimeout(() => {
                loader.style.display = "none";
            }, 500); // espera a que termine la transición
        }, 1500); // falso tiempo de carga: 1.5 segundos
    }
});

// Mostrar la pantalla de carga cuando se hace clic en un enlace interno
document.querySelectorAll("a[href]").forEach((enlace) => {
    enlace.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Evitar abrir enlaces externos, anclas o con target="_blank"
        if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:") &&
            !this.hasAttribute("target") &&
            !href.startsWith("http")
        ) {
            e.preventDefault(); // prevenir redirección inmediata

            const loader = document.getElementById("pantalla-carga");
            if (loader) {
                loader.style.display = "flex";
                loader.style.opacity = "1";
            }

            setTimeout(() => {
                window.location.href = href; // redireccionar después del retardo
            }, 800); // tiempo visible del loader antes de redirigir
        }
    });
});
