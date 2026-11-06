// Perfil: carga con GET /usuarios/{id} y guarda con PUT /usuarios/{id}
// El tema se cambia al momento con elegirTema() de js/tema.js

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
    ayuda.textContent = ayuda.dataset.ayuda || "";   // regresa el texto de ayuda si tenía
}

function mostrarMensaje(tipo, texto) {
    resultado.className = `mensaje mensaje-${tipo}`;
    resultado.textContent = texto;
    resultado.hidden = false;
}

// Vacío = no se llenó; si no, tiene que ser entero mayor a 0
function enteroOpcional(texto) {
    if (texto.trim() === "") return { valido: true, valor: null };
    const numero = Number(texto);
    return { valido: Number.isInteger(numero) && numero > 0, valor: numero };
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

// Si cambian el tema con el sol y la luna, el selector se actualiza
document.getElementById("boton-tema").addEventListener("click", () => marcarTema(leerPreferenciaTema()));

marcarTema(leerPreferenciaTema());

// ---------- Cargar el perfil ----------

function ponerValor(id, valor) {
    if (valor !== undefined && valor !== null) document.getElementById(id).value = valor;
}

async function cargarPerfil() {
    try {
        const usuario = await obtenerUsuario(CONFIG.USUARIO_ID);
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

        // El tema guardado en la cuenta manda sobre el del navegador
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
    const personas = enteroOpcional(document.getElementById("personas").value);
    const tiempo = enteroOpcional(document.getElementById("tiempo_max_min").value);
    const meta = enteroOpcional(document.getElementById("meta").value);
    const proteina = enteroOpcional(document.getElementById("meta_proteina").value);

    let valido = true;

    if (!nombre) {
        mostrarError("campo-nombre", "Escribe tu nombre.");
        valido = false;
    }
    if (!correo.includes("@")) {
        mostrarError("campo-correo", "Revisa tu correo, le falta la @.");
        valido = false;
    }
    if (!personas.valido || personas.valor === null) {
        mostrarError("campo-personas", "Escribe al menos 1 persona.");
        valido = false;
    }
    if (!tiempo.valido) {
        mostrarError("campo-tiempo_max_min", "Escribe los minutos.");
        valido = false;
    }
    if (!meta.valido) {
        mostrarError("campo-meta", "Escribe un número mayor a 0 o déjalo vacío.");
        valido = false;
    }
    if (!proteina.valido) {
        mostrarError("campo-meta_proteina", "Escribe un número mayor a 0 o déjalo vacío.");
        valido = false;
    }
    if (!valido) return;

    // Los nombres son los mismos de la tabla Usuarios
    const cambios = {
        nombre: nombre,
        correo: correo,
        personas: personas.valor,
        comidas_por_dia: Number(document.getElementById("comidas_por_dia").value),
        dia_escaneo: document.getElementById("dia_escaneo").value,
        tiempo_max_min: tiempo.valor,
        meta_calorias: meta.valor,
        meta_proteina: proteina.valor,
        preferencias: [...document.querySelectorAll('input[name="preferencias"]:checked')].map((casilla) => casilla.value),
        tema: leerPreferenciaTema()
    };

    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        await actualizarUsuario(CONFIG.USUARIO_ID, cambios);
        pintarEncabezado(nombre, correo);
        mostrarMensaje("exito", "Listo, guardamos tus cambios.");
    } catch (error) {
        mostrarMensaje("error", `No pudimos guardar tus cambios. ${error.message}`);
    } finally {
        boton.disabled = false;
    }
});

// Quita el error en cuanto la persona corrige el campo
["nombre", "correo", "personas", "tiempo_max_min", "meta", "meta_proteina"].forEach((id) => {
    const idCampo = id === "meta" ? "campo-meta" : `campo-${id}`;
    document.getElementById(id).addEventListener("input", () => quitarError(idCampo));
});

cargarPerfil();
