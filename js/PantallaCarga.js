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
            }, 100); // espera a que termine la transición
        }, 1000); // falso tiempo de carga: 1.5 segundos
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

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".borde-menu");
    let currentPath = window.location.pathname;

    // Extrae solo el nombre del archivo (o vacío si estás en "/")
    let currentPage = currentPath.substring(currentPath.lastIndexOf("/") + 1);

    // Si está vacío (caso de la raíz), asumimos que es "index.html"
    if (currentPage === "") currentPage = "index.html";

    links.forEach(link => {
        const href = link.getAttribute("href");

        // Compara solo el nombre del archivo
        if (href === currentPage) {
            link.classList.add("activo");
        } else {
            link.classList.remove("activo");
        }
    });
});

