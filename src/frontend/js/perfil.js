const formulario = document.getElementById("formulario-perfil");
const resultado = document.getElementById("resultado");

function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    campo.classList.add("campo-error");
    campo.querySelector("small").textContent = mensaje;
}

function quitarError(idCampo) {
    const campo = document.getElementById(idCampo);
    const ayuda = campo.querySelector("small");
    campo.classList.remove("campo-error");
    ayuda.textContent = ayuda.dataset.ayuda || "";
}

function esNumeroPositivo(texto) {
    const numero = Number(texto);
    return texto !== "" && Number.isInteger(numero) && numero > 0;
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    const meta = document.getElementById("meta").value;
    const presupuesto = document.getElementById("presupuesto").value;
    const nombre = document.getElementById("nombre").value.trim();
    const edad = document.getElementById("edad").value;
    const correo = document.getElementById("correo").value.trim();

    let valido = true;

    if (!esNumeroPositivo(meta)) {
        mostrarError("campo-meta", "Escribe un número mayor a 0.");
        valido = false;
    }
    if (!esNumeroPositivo(presupuesto)) {
        mostrarError("campo-presupuesto", "Escribe un monto mayor a 0.");
        valido = false;
    }
    if (!nombre) {
        mostrarError("campo-nombre", "Escribe tu nombre.");
        valido = false;
    }
    if (!esNumeroPositivo(edad)) {
        mostrarError("campo-edad", "Escribe tu edad.");
        valido = false;
    }
    if (!correo.includes("@")) {
        mostrarError("campo-correo", "Revisa tu correo, le falta la @.");
        valido = false;
    }

    if (!valido) return;

    // Los nombres son los mismos de la tabla Usuarios
    const perfil = {
        usuario_id: "u1",
        nombre: nombre,
        edad: Number(edad),
        correo: correo,
        presupuesto: Number(presupuesto),
        meta_calorias: Number(meta)
    };

    // Actualiza el encabezado con los datos nuevos
    document.getElementById("nombre-titulo").textContent = perfil.nombre;
    document.getElementById("correo-titulo").textContent = perfil.correo;
    document.getElementById("avatar-grande").textContent = perfil.nombre.charAt(0).toUpperCase();

    resultado.className = "mensaje mensaje-exito";
    resultado.textContent = "Listo, guardamos tus cambios.";
    resultado.hidden = false;
});

// Quita el error en cuanto la persona corrige el campo
["meta", "presupuesto", "nombre", "edad", "correo"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => quitarError("campo-" + id));
});