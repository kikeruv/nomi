const ingredientes = [];
let archivoFoto = null;

const lista = document.getElementById("lista-ingredientes");
const sinIngredientes = document.getElementById("sin-ingredientes");
const contador = document.getElementById("contador");
const resultado = document.getElementById("resultado");
const inputPersonas = document.getElementById("personas");
const inputComidas = document.getElementById("comidas");
const nuevoNombre = document.getElementById("nuevo-nombre");
const nuevaCantidad = document.getElementById("nueva-cantidad");
const botonGenerar = document.getElementById("boton-generar");

// ---------- Errores y Mensajes ----------

function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (campo) {
        campo.classList.add("campo-error");
        const small = campo.querySelector("small");
        if (small) small.textContent = mensaje;
    }
}

function quitarError(idCampo) {
    const campo = document.getElementById(idCampo);
    if (campo) {
        campo.classList.remove("campo-error");
        const small = campo.querySelector("small");
        if (small) small.textContent = "";
    }
}

function mostrarMensaje(tipo, texto) {
    if (!resultado) return;
    resultado.className = `mensaje mensaje-${tipo}`;
    resultado.textContent = texto;
    resultado.hidden = false;
}

// ---------- Foto (Vista previa + Subida a AWS S3) ----------

document.getElementById("foto")?.addEventListener("change", async (evento) => {
    archivoFoto = evento.target.files[0];
    if (!archivoFoto) return;

    // 1. Vista previa local
    const vista = document.getElementById("vista-foto");
    if (vista) {
        vista.src = URL.createObjectURL(archivoFoto);
        vista.hidden = false;
    }
    document.getElementById("zona-foto")?.classList.add("con-foto");

    const megas = (archivoFoto.size / (1024 * 1024)).toFixed(1);
    const elemNombre = document.getElementById("nombre-foto");
    if (elemNombre) elemNombre.textContent = `${archivoFoto.name} · ${megas} MB`;

    // 2. Subir automáticamente a AWS S3
    mostrarMensaje("info", "Subiendo imagen para análisis de IA...");
    const usuarioId = CONFIG.USUARIO_ID || 'u1';
    const subida = await escanearRefrigerador(archivoFoto, usuarioId);

    if (subida.success) {
        mostrarMensaje("exito", "¡Foto subida correctamente! Rekognition está procesando la imagen...");
        // Recargar el historial inferior tras 3 segundos para mostrar la nueva foto e ingredientes
        setTimeout(() => {
            if (typeof cargarHistorialEscaneos === "function") {
                cargarHistorialEscaneos();
            }
        }, 3000);
    } else {
        mostrarMensaje("error", `Error al subir la imagen a AWS: ${subida.error}`);
    }
});

// ---------- Subida a AWS S3 vía API Gateway ----------

async function escanearRefrigerador(file, userId) {
    try {
        const apiUrl = CONFIG.API_REFRI_URL;

        const resFirma = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fileType: file.type || 'image/jpeg',
                userId: userId
            })
        });
        
        const dataFirma = await resFirma.json();
        if (!resFirma.ok) throw new Error(dataFirma.error || "Error al obtener firma de AWS");

        const resS3 = await fetch(dataFirma.url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'image/jpeg' },
            body: file
        });

        if (!resS3.ok) throw new Error("Error al subir archivo a S3");
        
        return { success: true, clave: dataFirma.clave };
    } catch (error) {
        console.error("Error en el escaneo AWS:", error);
        return { success: false, error: error.message };
    }
}

// ---------- Historial de escaneos (fotos + ingredientes de Rekognition) ----------
// GET API_REFRI_URL?userId=... -> { fotos: [{ url_foto, createdAt, ingredientes: [..] }] }

async function cargarHistorialEscaneos() {
    const contenedor = document.getElementById("historialContainer");
    if (!contenedor) return;

    try {
        const res = await fetch(`${CONFIG.API_REFRI_URL}?userId=${encodeURIComponent(CONFIG.USUARIO_ID)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar el historial");

        contenedor.innerHTML = "";
        const fotos = data.fotos || [];
        if (fotos.length === 0) {
            contenedor.appendChild(crear("p", "", "Todavía no has escaneado tu refri."));
            return;
        }

        fotos.forEach((item) => {
            const tarjeta = crear("div", "tarjeta");

            const img = crear("img");
            img.src = item.url_foto;
            img.alt = "Foto de tu refri";
            img.style.cssText = "width: 100%; height: 160px; object-fit: cover; border-radius: var(--borde-medio)";

            const fecha = new Date(item.createdAt * 1000).toLocaleDateString("es-MX");
            const detectados = item.ingredientes && item.ingredientes.length
                ? item.ingredientes.join(", ")
                : "Procesando con IA…";

            tarjeta.append(img, crear("p", "", `Fecha: ${fecha}`), crear("p", "", `Ingredientes: ${detectados}`));
            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        contenedor.innerHTML = "";
        const aviso = document.getElementById("error");
        if (aviso) {
            aviso.textContent = `No pudimos cargar tu historial. ${error.message}`;
            aviso.hidden = false;
        }
    }
}

// ---------- Lista de Ingredientes Manuales ----------

function pintarIngredientes() {
    if (!lista) return;
    lista.querySelectorAll(".fila-ingrediente").forEach((fila) => fila.remove());
    if (sinIngredientes) sinIngredientes.hidden = ingredientes.length > 0;

    ingredientes.forEach((ingrediente, i) => {
        const fila = document.createElement("div");
        fila.className = "fila-ingrediente";

        const etiqueta = document.createElement("label");
        const casilla = document.createElement("span");
        casilla.className = ingrediente.tengo ? "casilla casilla-marcada" : "casilla";
        casilla.textContent = ingrediente.tengo ? "✓" : "";
        etiqueta.append(casilla, ingrediente.nombre);

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
    if (contador) contador.textContent = `${marcados} seleccionados`;
}

function agregarIngrediente() {
    const nombre = nuevoNombre.value.trim();
    if (!nombre) {
        mostrarError("campo-nombre", "Escribe el ingrediente.");
        nuevoNombre.focus();
        return;
    }

    const repetido = ingredientes.some((ing) => ing.nombre.toLowerCase() === nombre.toLowerCase());
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

document.getElementById("boton-agregar")?.addEventListener("click", agregarIngrediente);

[nuevoNombre, nuevaCantidad].forEach((input) => {
    input?.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            agregarIngrediente();
        }
    });
});

nuevoNombre?.addEventListener("input", () => quitarError("campo-nombre"));
inputPersonas?.addEventListener("input", () => quitarError("campo-personas"));
inputComidas?.addEventListener("input", () => quitarError("campo-comidas"));

// ---------- Cargar Perfil y Guardar ----------

async function cargarPerfil() {
    try {
        if (typeof obtenerUsuario === "function" && CONFIG.USUARIO_ID) {
            const usuario = await obtenerUsuario(CONFIG.USUARIO_ID);
            if (!usuario) return;
            if (typeof ponerAvatar === "function") ponerAvatar(usuario);
            if (usuario.personas && inputPersonas) inputPersonas.value = usuario.personas;
            if (usuario.comidas_por_dia && inputComidas) inputComidas.value = usuario.comidas_por_dia;
        }
    } catch (error) {
        // Silencioso
    }
}

document.getElementById("formulario-ingredientes")?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (resultado) resultado.hidden = true;

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

    const escaneo = {
        usuario_id: CONFIG.USUARIO_ID || 'u1',
        personas: personas,
        comidas_por_dia: comidas,
        ingredientes: seleccionados.map((ingrediente) => ({
            nombre: ingrediente.nombre,
            cantidad: ingrediente.cantidad
        }))
    };

    if (botonGenerar) {
        botonGenerar.disabled = true;
        botonGenerar.textContent = "Guardando…";
    }

    try {
        if (typeof guardarEscaneo === "function") {
            await guardarEscaneo(escaneo);
        }
        window.location.href = "menu.html";
    } catch (error) {
        mostrarMensaje("error", `No pudimos guardar tus ingredientes. ${error.message}`);
        if (botonGenerar) {
            botonGenerar.disabled = false;
            botonGenerar.textContent = "Generar menú de la semana";
        }
    }
});

// ---------- Inicialización ----------

pintarIngredientes();
cargarPerfil();
cargarHistorialEscaneos();