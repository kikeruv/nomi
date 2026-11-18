// Escanear refri: sube la foto, Rekognition detecta ingredientes, arma la lista y genera el menú

// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();

const ingredientes = [];
const resultado = document.getElementById("resultado");
const nuevoNombre = document.getElementById("nuevo-nombre");
const nuevaCantidad = document.getElementById("nueva-cantidad");
const botonGenerar = document.getElementById("boton-generar");

function mostrarMensaje(tipo, texto) {
    resultado.className = `mensaje mensaje-${tipo}`;
    resultado.textContent = texto;
    resultado.hidden = false;
}

// ---------- Foto del refri ----------

// Pide la URL firmada y sube la foto directo a S3
async function subirFoto(foto) {
    const firma = await pedirUrlFoto();
    const respuesta = await fetch(firma.url, {
        method: "PUT",
        headers: { "Content-Type": foto.type },
        body: foto
    });
    if (!respuesta.ok) throw new Error("S3 no aceptó la foto.");
}

document.getElementById("foto").addEventListener("change", async (evento) => {
    const foto = evento.target.files[0];

    // Vista previa
    const vista = document.getElementById("vista-foto");
    vista.src = URL.createObjectURL(foto);
    vista.hidden = false;
    document.getElementById("zona-foto").classList.add("con-foto");
    document.getElementById("nombre-foto").textContent = foto.name;

    mostrarMensaje("info", "Subiendo la foto…");
    try {
        await subirFoto(foto);
        mostrarMensaje("exito", "Foto subida. Rekognition está buscando los ingredientes…");
        setTimeout(cargarHistorial, 5000);
    } catch (error) {
        mostrarMensaje("error", `No pudimos subir la foto. ${error.message}`);
    }
});

// ---------- Historial de fotos ----------

async function cargarHistorial() {
    const contenedor = document.getElementById("historialContainer");

    try {
        const fotos = (await obtenerFotos()).fotos;

        contenedor.innerHTML = "";
        if (fotos.length === 0) {
            contenedor.appendChild(crear("p", "", "Todavía no has escaneado tu refri."));
            return;
        }

        fotos.forEach((foto) => {
            const imagen = crear("img", "imagen-receta");
            imagen.src = foto.url;
            imagen.alt = "Foto de tu refri";

            const fecha = new Date(foto.fecha).toLocaleDateString("es-MX");
            const tarjeta = crear("div", "tarjeta");
            tarjeta.append(imagen, crear("p", "", `Fecha: ${fecha}`));

            // null = Rekognition sigue procesando
            if (foto.ingredientes === null) {
                tarjeta.appendChild(crear("p", "", "Ingredientes: procesando…"));
            } else {
                tarjeta.appendChild(crear("p", "", `Ingredientes: ${foto.ingredientes.join(", ") || "no encontramos"}`));
                const boton = crear("button", "boton boton-secundario boton-chico", "Usar estos ingredientes");
                boton.type = "button";
                boton.addEventListener("click", () => usarIngredientes(foto.ingredientes));
                tarjeta.appendChild(boton);
            }
            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        mostrarErrorPagina(`No pudimos cargar tu historial. ${error.message}`);
    }
}

// ---------- Lista de ingredientes ----------

function pintarIngredientes() {
    const lista = document.getElementById("lista-ingredientes");
    lista.querySelectorAll(".fila-ingrediente").forEach((fila) => fila.remove());
    document.getElementById("sin-ingredientes").hidden = ingredientes.length > 0;

    ingredientes.forEach((ingrediente) => {
        const casilla = crear("span", ingrediente.tengo ? "casilla casilla-marcada" : "casilla", ingrediente.tengo ? "✓" : "");
        const etiqueta = crear("label");
        etiqueta.append(casilla, ingrediente.nombre);
        etiqueta.addEventListener("click", () => {
            ingrediente.tengo = !ingrediente.tengo;
            pintarIngredientes();
        });

        const fila = crear("div", "fila-ingrediente");
        fila.append(etiqueta, crear("small", "", ingrediente.cantidad || "—"));
        lista.appendChild(fila);
    });

    const marcados = ingredientes.filter((ingrediente) => ingrediente.tengo).length;
    document.getElementById("contador").textContent = `${marcados} seleccionados`;
}

function agregarIngrediente() {
    ingredientes.push({ nombre: nuevoNombre.value.trim(), cantidad: nuevaCantidad.value.trim(), tengo: true });
    nuevoNombre.value = "";
    nuevaCantidad.value = "";
    nuevoNombre.focus();
    pintarIngredientes();
}

// Pasa a la lista los ingredientes de una foto (los que ya están no se repiten)
function usarIngredientes(nombres) {
    nombres.forEach((nombre) => {
        if (!ingredientes.some((ingrediente) => ingrediente.nombre === nombre)) {
            ingredientes.push({ nombre: nombre, cantidad: "", tengo: true });
        }
    });
    pintarIngredientes();
}

document.getElementById("boton-agregar").addEventListener("click", agregarIngrediente);

// Enter en el nombre o la cantidad también agrega
[nuevoNombre, nuevaCantidad].forEach((campo) => {
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            agregarIngrediente();
        }
    });
});

// ---------- Generar menú ----------

document.getElementById("formulario-ingredientes").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    resultado.hidden = true;

    // Mismos nombres que la tabla Escaneos
    const escaneo = {
        usuario_id: USUARIO_ID,
        personas: Number(document.getElementById("personas").value),
        comidas_por_dia: Number(document.getElementById("comidas").value),
        ingredientes: ingredientes
            .filter((ingrediente) => ingrediente.tengo)
            .map((ingrediente) => ({ nombre: ingrediente.nombre, cantidad: ingrediente.cantidad }))
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

// ---------- Al abrir la página ----------

// Llena personas y comidas con el perfil
async function cargarPerfil() {
    const usuario = await obtenerUsuario(USUARIO_ID);
    if (!usuario) return;
    ponerAvatar(usuario);
    document.getElementById("personas").value = usuario.personas || "";
    document.getElementById("comidas").value = usuario.comidas_por_dia || 3;
}

pintarIngredientes();
cargarPerfil();
cargarHistorial();
