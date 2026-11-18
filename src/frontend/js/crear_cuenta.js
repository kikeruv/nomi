// Crear cuenta: 1) Cognito manda un código al correo  2) se confirma y se guarda el perfil

const formulario = document.getElementById("formulario-registro");
const formularioCodigo = document.getElementById("formulario-codigo");
const resultado = document.getElementById("resultado");
const resultadoCodigo = document.getElementById("resultado-codigo");

function mostrarMensaje(caja, mensaje) {
    caja.className = "mensaje mensaje-error";
    caja.textContent = mensaje;
    caja.hidden = false;
}

// Mismos nombres que la tabla Usuarios
function leerPerfil() {
    const perfil = {
        usuario_id: usuarioActual(),
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        personas: Number(document.getElementById("personas").value),
        comidas_por_dia: 3,
        preferencias: [],
        tema: leerPreferenciaTema()
    };
    const meta = document.getElementById("meta").value.trim();
    if (meta !== "") perfil.meta_calorias = Number(meta);
    return perfil;
}

// Guarda el perfil; si el backend lo rechaza, regresa al formulario para corregirlo
async function guardarPerfil() {
    try {
        await crearUsuario(leerPerfil());
        window.location.href = "dashboard.html";
    } catch (error) {
        formularioCodigo.hidden = true;
        formulario.hidden = false;
        document.getElementById("correo").disabled = true;
        document.getElementById("contrasena").disabled = true;
        formulario.querySelector("button").textContent = "Guardar y entrar";
        mostrarMensaje(resultado, error.message);
    }
}

// Paso 1
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    // Ya confirmó la cuenta: solo falta el perfil
    if (usuarioActual()) {
        await guardarPerfil();
        return;
    }

    try {
        await registrarse(document.getElementById("correo").value.trim(), document.getElementById("contrasena").value);
        document.getElementById("texto-codigo").textContent = `Te mandamos un código a ${document.getElementById("correo").value.trim()}.`;
        formulario.hidden = true;
        formularioCodigo.hidden = false;
    } catch (error) {
        mostrarMensaje(resultado, error.message);
    }
});

// Paso 2
formularioCodigo.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultadoCodigo.hidden = true;

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {
        await confirmarCuenta(correo, document.getElementById("codigo").value.trim());
        await iniciarSesion(correo, contrasena);
    } catch (error) {
        mostrarMensaje(resultadoCodigo, error.message);
        return;
    }

    await guardarPerfil();
});
