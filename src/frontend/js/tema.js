function leerPreferenciaTema() {
    try {
        return localStorage.getItem("nomi-tema") || "auto";
    } catch (error) {
        return "auto";   // El navegador no deja guardar: usamos automático
    }
}

function guardarPreferenciaTema(preferencia) {
    try {
        localStorage.setItem("nomi-tema", preferencia);
    } catch (error) {
        // Sin almacenamiento: el tema cambia, pero no se recuerda
    }
}

// Convierte "auto" en "dark" o "light" según el sistema
function temaReal(preferencia) {
    if (preferencia === "auto") {
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return preferencia;
}

function aplicarTema(preferencia) {
    document.documentElement.dataset.theme = temaReal(preferencia);
}

// Se usa desde Perfil (Automático / Oscuro / Claro)
function elegirTema(preferencia) {
    guardarPreferenciaTema(preferencia);
    aplicarTema(preferencia);
}

// 1. Aplicar el tema guardado en cuanto carga el script
aplicarTema(leerPreferenciaTema());

// 2. Si está en automático y el sistema cambia de tema, seguirlo
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (leerPreferenciaTema() === "auto") aplicarTema("auto");
});

// 3. Botón de sol y luna: alterna entre oscuro y claro
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("boton-tema");
    if (!boton) return;

    boton.addEventListener("click", () => {
        const actual = document.documentElement.dataset.theme;
        elegirTema(actual === "light" ? "dark" : "light");
    });
});