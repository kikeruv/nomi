// Escanear refri: elegir la foto, armar la lista de ingredientes y guardar el escaneo
// POST /escaneos con { usuario_id, personas, comidas_por_dia, ingredientes: [{ nombre, cantidad }] }
// (La detección automática de ingredientes con la foto es de la entrega final.)

const ingredientes = [];

const lista = document.getElementById("lista-ingredientes");
const sinIngredientes = document.getElementById("sin-ingredientes");
const contador = document.getElementById("contador");
const resultado = document.getElementById("resultado");
const inputPersonas = document.getElementById("personas");
const inputComidas = document.getElementById("comidas");
const nuevoNombre = document.getElementById("nuevo-nombre");
const nuevaCantidad = document.getElementById("nueva-cantidad");
const botonGenerar = document.getElementById("boton-generar");

// ---------- Errores en los campos ----------

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

function mostrarMensaje(tipo, texto) {
    resultado.className = `mensaje mensaje-${tipo}`;
    resultado.textContent = texto;
    resultado.hidden = false;
}

// ---------- Foto (vista previa en el navegador) ----------

document.getElementById("foto").addEventListener("change", (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const vista = document.getElementById("vista-foto");
    vista.src = URL.createObjectURL(archivo);
    vista.hidden = false;
    document.getElementById("zona-foto").classList.add("con-foto");

    const megas = (archivo.size / (1024 * 1024)).toFixed(1);
    document.getElementById("nombre-foto").textContent = `${archivo.name} · ${megas} MB`;
});

// ---------- Lista de ingredientes ----------

function pintarIngredientes() {
    lista.querySelectorAll(".fila-ingrediente").forEach((fila) => fila.remove());
    sinIngredientes.hidden = ingredientes.length > 0;

    ingredientes.forEach((ingrediente, i) => {
        const fila = document.createElement("div");
        fila.className = "fila-ingrediente";

        const etiqueta = document.createElement("label");
        const casilla = document.createElement("span");
        casilla.className = ingrediente.tengo ? "casilla casilla-marcada" : "casilla";
        casilla.textContent = ingrediente.tengo ? "✓" : "";
        etiqueta.append(casilla, ingrediente.nombre);

        // Tocar el ingrediente lo marca o desmarca
        etiqueta.addEventListener("click", () => {
            ingredientes[i].tengo = !ingredientes[i].tengo;
            pintarIngredientes();
        });

        const cantidad = document.createElement("small");
        cantidad.textContent = ingrediente.cantidad || "—";

        fila.append(etiqueta, cantidad);
        lista.appendChild(fila);
    });

    const marcados = ingredientes.filter((ingrediente) => ingrediente.tengo).length;
    contador.textContent = `${marcados} seleccionados`;
}

function agregarIngrediente() {
    const nombre = nuevoNombre.value.trim();
    if (!nombre) {
        mostrarError("campo-nombre", "Escribe el ingrediente.");
        nuevoNombre.focus();
        return;
    }

    const repetido = ingredientes.some((ingrediente) => ingrediente.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido) {
        mostrarError("campo-nombre", "Ese ingrediente ya está en la lista.");
        return;
    }

    ingredientes.push({ nombre: nombre, cantidad: nuevaCantidad.value.trim(), tengo: true });
    nuevoNombre.value = "";
    nuevaCantidad.value = "";
    nuevoNombre.focus();
    pintarIngredientes();
}

document.getElementById("boton-agregar").addEventListener("click", agregarIngrediente);

// Enter en los campos de ingrediente agrega en lugar de enviar el formulario
[nuevoNombre, nuevaCantidad].forEach((input) => {
    input.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            agregarIngrediente();
        }
    });
});

nuevoNombre.addEventListener("input", () => quitarError("campo-nombre"));
inputPersonas.addEventListener("input", () => quitarError("campo-personas"));
inputComidas.addEventListener("input", () => quitarError("campo-comidas"));

// ---------- Datos del perfil (personas y comidas por día) ----------

async function cargarPerfil() {
    try {
        const usuario = await obtenerUsuario(CONFIG.USUARIO_ID);
        if (!usuario) return;
        ponerAvatar(usuario);
        if (usuario.personas) inputPersonas.value = usuario.personas;
        if (usuario.comidas_por_dia) inputComidas.value = usuario.comidas_por_dia;
    } catch (error) {
        // Si no se puede cargar el perfil, la persona los escribe a mano
    }
}

// ---------- Guardar escaneo y generar menú ----------

document.getElementById("formulario-ingredientes").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    const personas = Number(inputPersonas.value);
    const comidas = Number(inputComidas.value);
    const seleccionados = ingredientes.filter((ingrediente) => ingrediente.tengo);
    let valido = true;

    if (!Number.isInteger(personas) || personas < 1) {
        mostrarError("campo-personas", "Escribe al menos 1 persona.");
        valido = false;
    }
    if (!Number.isInteger(comidas) || comidas < 1 || comidas > 3) {
        mostrarError("campo-comidas", "Elige de 1 a 3 comidas.");
        valido = false;
    }
    if (seleccionados.length === 0) {
        mostrarMensaje("error", "Agrega y selecciona al menos un ingrediente.");
        valido = false;
    }
    if (!valido) return;

    // Los nombres son los mismos de la tabla Escaneos
    const escaneo = {
        usuario_id: CONFIG.USUARIO_ID,
        personas: personas,
        comidas_por_dia: comidas,
        ingredientes: seleccionados.map((ingrediente) => ({
            nombre: ingrediente.nombre,
            cantidad: ingrediente.cantidad
        }))
    };

    botonGenerar.disabled = true;
    botonGenerar.textContent = "Guardando…";

    try {
        await guardarEscaneo(escaneo);
        window.location.href = "menu.html";
    } catch (error) {
        mostrarMensaje("error", `No pudimos guardar tus ingredientes. ${error.message}`);
        botonGenerar.disabled = false;
        botonGenerar.textContent = "Generar menú de la semana";
    }
});

pintarIngredientes();
cargarPerfil();
