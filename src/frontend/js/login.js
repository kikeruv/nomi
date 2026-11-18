// Login con Cognito
const formulario = document.getElementById("formulario-acceso");
const resultado = document.getElementById("resultado");

// Si no tiene perfil en la tabla Usuarios, le crea uno básico
async function asegurarPerfil() {
    const usuarioId = usuarioActual();
    if (await obtenerUsuario(usuarioId)) return;

    const correo = datosDelToken().email;
    await crearUsuario({
        usuario_id: usuarioId,
        nombre: correo.split("@")[0],
        correo: correo,
        personas: 1,
        comidas_por_dia: 3,
        preferencias: [],
        tema: leerPreferenciaTema()
    });
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Entrando…";

    try {
        await iniciarSesion(document.getElementById("correo").value.trim(), document.getElementById("contrasena").value);
        await asegurarPerfil();
        window.location.href = "dashboard.html";
    } catch (error) {
        resultado.className = "mensaje mensaje-error";
        resultado.textContent = error.message;
        resultado.hidden = false;
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
    }
});
