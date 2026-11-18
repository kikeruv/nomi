// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();

// Perfil: carga y guarda los datos del usuario

const formulario = document.getElementById("formulario-perfil");
const resultado = document.getElementById("resultado");

function mostrarMensaje(tipo, texto) {
    resultado.className = `mensaje mensaje-${tipo}`;
    resultado.textContent = texto;
    resultado.hidden = false;
}

// Vacío = null (el backend lo borra)
function numeroOpcional(texto) {
    return texto.trim() === "" ? null : Number(texto);
}

function pintarEncabezado(nombre, correo) {
    document.getElementById("nombre-titulo").textContent = nombre || "";
    document.getElementById("correo-titulo").textContent = correo || "";
    document.getElementById("avatar-grande").textContent = nombre ? nombre.charAt(0).toUpperCase() : "";
    ponerAvatar({ nombre: nombre });
}

// ---------- Tema (Automático / Oscuro / Claro) ----------

const botonesTema = document.querySelectorAll("#selector-tema button");

function marcarTema(preferencia) {
    botonesTema.forEach((boton) => boton.setAttribute("aria-checked", String(boton.dataset.tema === preferencia)));
}

botonesTema.forEach((boton) => {
    boton.addEventListener("click", () => {
        elegirTema(boton.dataset.tema);
        marcarTema(boton.dataset.tema);
    });
});

// Si cambian el tema con el botón, se actualiza el selector
document.getElementById("boton-tema").addEventListener("click", () => marcarTema(leerPreferenciaTema()));

marcarTema(leerPreferenciaTema());

// ---------- Cargar el perfil ----------

function ponerValor(id, valor) {
    if (valor !== undefined && valor !== null) document.getElementById(id).value = valor;
}

async function cargarPerfil() {
    try {
        const usuario = await obtenerUsuario(USUARIO_ID);
        if (!usuario) {
            mostrarMensaje("error", "No encontramos tu perfil.");
            return;
        }

        pintarEncabezado(usuario.nombre, usuario.correo);
        ponerValor("nombre", usuario.nombre);
        ponerValor("correo", usuario.correo);
        ponerValor("personas", usuario.personas);
        ponerValor("comidas_por_dia", usuario.comidas_por_dia);
        ponerValor("dia_escaneo", usuario.dia_escaneo);
        ponerValor("tiempo_max_min", usuario.tiempo_max_min);
        ponerValor("meta", usuario.meta_calorias);
        ponerValor("meta_proteina", usuario.meta_proteina);

        const preferencias = usuario.preferencias || [];
        document.querySelectorAll('input[name="preferencias"]').forEach((casilla) => {
            casilla.checked = preferencias.includes(casilla.value);
        });

        // Usa el tema guardado en la cuenta
        if (usuario.tema) {
            elegirTema(usuario.tema);
            marcarTema(usuario.tema);
        }
    } catch (error) {
        mostrarMensaje("error", `No pudimos cargar tu perfil. ${error.message}`);
    }
}

// ---------- Guardar ----------

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const personas = numeroOpcional(document.getElementById("personas").value);
    const tiempo = numeroOpcional(document.getElementById("tiempo_max_min").value);
    const meta = numeroOpcional(document.getElementById("meta").value);
    const proteina = numeroOpcional(document.getElementById("meta_proteina").value);

    // Mismos nombres que la tabla Usuarios
    const cambios = {
        nombre: nombre,
        correo: correo,
        personas: personas,
        comidas_por_dia: Number(document.getElementById("comidas_por_dia").value),
        dia_escaneo: document.getElementById("dia_escaneo").value,
        tiempo_max_min: tiempo,
        meta_calorias: meta,
        meta_proteina: proteina,
        preferencias: [...document.querySelectorAll('input[name="preferencias"]:checked')].map((casilla) => casilla.value),
        tema: leerPreferenciaTema()
    };

    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        await actualizarUsuario(USUARIO_ID, cambios);
        pintarEncabezado(nombre, correo);
        mostrarMensaje("exito", "Listo, guardamos tus cambios.");
    } catch (error) {
        mostrarMensaje("error", `No pudimos guardar tus cambios. ${error.message}`);
    } finally {
        boton.disabled = false;
    }
});

// Cerrar sesión
document.getElementById("boton-cerrar-sesion").addEventListener("click", cerrarSesion);

cargarPerfil();
