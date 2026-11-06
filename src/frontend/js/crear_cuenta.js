// Crear cuenta: valida el formulario y crea el usuario con POST /usuarios
// La contraseña NO se manda a DynamoDB; en la entrega final la maneja Cognito.

const formulario = document.getElementById("formulario-registro");
const resultado = document.getElementById("resultado");

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

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const personas = Number(document.getElementById("personas").value);
    const textoMeta = document.getElementById("meta").value.trim();
    const meta = Number(textoMeta);

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

    if (!Number.isInteger(personas) || personas < 1) {
        mostrarError("campo-personas", "Escribe al menos 1.");
        valido = false;
    }

    // La meta es opcional: vacía está bien
    if (textoMeta !== "" && (!Number.isInteger(meta) || meta < 1)) {
        mostrarError("campo-meta", "Escribe un número mayor a 0.");
        valido = false;
    }

    if (!valido) return;

    // Los nombres son los mismos de la tabla Usuarios
    const usuario = {
        usuario_id: CONFIG.USUARIO_ID,
        nombre: nombre,
        correo: correo,
        personas: personas,
        comidas_por_dia: 3,
        meta_calorias: textoMeta === "" ? null : meta,
        preferencias: [],
        tema: leerPreferenciaTema()
    };

    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Creando…";

    try {
        await crearUsuario(usuario);
        window.location.href = "dashboard.html";
    } catch (error) {
        resultado.className = "mensaje mensaje-error";
        resultado.textContent = `No pudimos crear tu cuenta. ${error.message}`;
        resultado.hidden = false;
        boton.disabled = false;
        boton.textContent = "Crear cuenta";
    }
});

// Quita el error en cuanto la persona corrige el campo
["nombre", "correo", "contrasena", "personas", "meta"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => quitarError("campo-" + id));
});
