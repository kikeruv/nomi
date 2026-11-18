function leerPreferenciaTema() {
    try {
        return localStorage.getItem("nomi-tema") || "auto";
    } catch (error) {
        return "auto";
    }
}

function guardarPreferenciaTema(preferencia) {
    try {
        localStorage.setItem("nomi-tema", preferencia);
    } catch (error) {
    }
}

// "auto" -> "dark" o "light" según el sistema
function temaReal(preferencia) {
    if (preferencia === "auto") {
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return preferencia;
}

function aplicarTema(preferencia) {
    document.documentElement.dataset.theme = temaReal(preferencia);
}

// Lo usa Perfil
function elegirTema(preferencia) {
    guardarPreferenciaTema(preferencia);
    aplicarTema(preferencia);
}

// Aplica el tema al cargar
aplicarTema(leerPreferenciaTema());

// En automático sigue al sistema
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (leerPreferenciaTema() === "auto") aplicarTema("auto");
});

// Botón de sol y luna
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("boton-tema");
    if (!boton) return;

    boton.addEventListener("click", () => {
        const actual = document.documentElement.dataset.theme;
        elegirTema(actual === "light" ? "dark" : "light");
    });
});