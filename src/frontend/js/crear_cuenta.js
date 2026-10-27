const formulario = document.getElementById("formulario-registro");

function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    campo.classList.add("campo-error");
    campo.querySelector("small").textContent = mensaje;
}

function quitarError(idCampo) {
    const campo = document.getElementById(idCampo);
    const ayuda = campo.querySelector("small");
    campo.classList.remove("campo-error");
    ayuda.textContent = ayuda.dataset.ayuda || "";   // regresa el texto de ayuda si tenía
}

function esNumeroPositivo(texto) {
    const numero = Number(texto);
    return texto !== "" && Number.isInteger(numero) && numero > 0;
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const edad = document.getElementById("edad").value;
    const presupuesto = document.getElementById("presupuesto").value;
    const meta = document.getElementById("meta").value;

    let valido = true;

    if (!nombre) {
        mostrarError("campo-nombre", "Escribe tu nombre.");
        valido = false;
    }

    if (!correo) {
        mostrarError("campo-correo", "Escribe tu correo.");
        valido = false;
    } else if (!correo.includes("@")) {
        mostrarError("campo-correo", "Revisa tu correo, le falta la @.");
        valido = false;
    }

    if (contrasena.length < 8) {
        mostrarError("campo-contrasena", "Usa al menos 8 caracteres.");
        valido = false;
    }

    if (!esNumeroPositivo(edad)) {
        mostrarError("campo-edad", "Escribe tu edad.");
        valido = false;
    }

    if (!esNumeroPositivo(presupuesto)) {
        mostrarError("campo-presupuesto", "Escribe un monto.");
        valido = false;
    }

    if (!esNumeroPositivo(meta)) {
        mostrarError("campo-meta", "Escribe un número mayor a 0.");
        valido = false;
    }

    if (valido) {
        window.location.href = "dashboard.html";
    }
});

// Quita el error en cuanto la persona corrige el campo
["nombre", "correo", "contrasena", "edad", "presupuesto", "meta"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => quitarError("campo-" + id));
});