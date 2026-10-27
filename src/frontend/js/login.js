const formulario = document.getElementById("formulario-acceso");
const correo = document.getElementById("correo");
const contrasena = document.getElementById("contrasena");

function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    campo.classList.add("campo-error");
    campo.querySelector("small").textContent = mensaje;
}

function quitarError(idCampo) {
    const campo = document.getElementById(idCampo);
    campo.classList.remove("campo-error");
    campo.querySelector("small").textContent = "";
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let valido = true;

    if (!correo.value.trim()) {
        mostrarError("campo-correo", "Escribe tu correo.");
        valido = false;
    } else if (!correo.value.includes("@")) {
        mostrarError("campo-correo", "Revisa tu correo, le falta la @.");
        valido = false;
    }

    if (!contrasena.value) {
        mostrarError("campo-contrasena", "Escribe tu contraseña.");
        valido = false;
    }

    if (valido) {
        window.location.href = "dashboard.html";
    }
});

// Quita el error en cuanto la persona corrige el campo
correo.addEventListener("input", () => quitarError("campo-correo"));
contrasena.addEventListener("input", () => quitarError("campo-contrasena"));