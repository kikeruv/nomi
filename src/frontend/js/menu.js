// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();


// Menú de la semana y cambio de platillos

const SEMANA = semanaISO();

let menu = null;
let escaneo = null;
let cambio = null;              
let opcionElegida = null;       
const recetasPorTipo = {};      

const panel = document.getElementById("panel-cambio");
const botonConfirmar = document.getElementById("boton-confirmar-cambio");

// ---------- Resumen ----------

function pintarResumen(usuario) {
    if (usuario && usuario.meta_calorias) {
        document.getElementById("meta-diaria").textContent = formatoNumero(usuario.meta_calorias);
    }

    const promedio = menu.dias.reduce((suma, dia) => suma + dia.total_kcal, 0) / menu.dias.length;
    document.getElementById("promedio").textContent = formatoNumero(Math.round(promedio));

    const comidas = menu.dias.flatMap((dia) => TIPOS_COMIDA.map((tipo) => dia.comidas[tipo]).filter(Boolean));
    const conRefri = comidas.filter((comida) => comida.usa_refri).length;
    document.getElementById("solo-refri").textContent = conRefri;
    document.getElementById("total-comidas").textContent = ` de ${comidas.length} comidas`;

    pintarIngredientes();

    // "Menú · 2 – 8 de noviembre"
    const primero = leerFecha(menu.dias[0].fecha);
    const ultimo = leerFecha(menu.dias[menu.dias.length - 1].fecha);
    const mes = ultimo.toLocaleDateString("es-MX", { month: "long" });
    document.getElementById("rango-semana").textContent = `Menú · ${primero.getDate()} – ${ultimo.getDate()} de ${mes}`;
}

function pintarIngredientes() {
    if (escaneo && escaneo.ingredientes) {
        document.getElementById("total-ingredientes").textContent = escaneo.ingredientes.length;
    }
}

// ---------- Cambiar un platillo ----------

async function recetasDe(tipo) {
    if (!recetasPorTipo[tipo]) {
        recetasPorTipo[tipo] = (await obtenerRecetas(tipo)) || [];
    }
    return recetasPorTipo[tipo];
}

// en_refri = ingredientes que tienes (lo calcula el backend)
function textoRefri(receta) {
    const tengo = (receta.en_refri || []).length;
    const total = receta.ingredientes.length;
    if (tengo === total) return "Usa tu refri";
    if (tengo * 2 >= total) return "Casi todo en tu refri";
    return "Te faltan ingredientes";
}

function crearOpcion(receta) {
    const opcion = crear("div", "opcion");
    opcion.tabIndex = 0;

    const nombres = receta.ingredientes.slice(0, 3).map((ingrediente) => ingrediente.nombre).join(", ");
    const datos = crear("div", "opcion-datos");
    datos.append(crear("span", "kcal", `${formatoNumero(receta.calorias)} kcal`), crear("span", "tiempo", `${receta.tiempo_min} min`));

    opcion.append(crear("span", "etiqueta", textoRefri(receta)), crear("h3", "", receta.titulo), crear("p", "", nombres), datos);

    const elegir = () => {
        document.querySelectorAll(".opcion").forEach((otra) => otra.classList.remove("opcion-elegida"));
        opcion.classList.add("opcion-elegida");
        opcionElegida = receta;
        botonConfirmar.disabled = false;
    };
    opcion.addEventListener("click", elegir);
    opcion.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            elegir();
        }
    });
    return opcion;
}

async function abrirCambio(indiceDia, tipo, fila) {
    const dia = menu.dias[indiceDia];
    const actual = dia.comidas[tipo];
    cambio = { indiceDia: indiceDia, tipo: tipo };
    opcionElegida = null;
    botonConfirmar.disabled = true;

    document.querySelectorAll(".comida-seleccionada").forEach((otra) => otra.classList.remove("comida-seleccionada"));
    fila.classList.add("comida-seleccionada");

    const nombreDia = leerFecha(dia.fecha).toLocaleDateString("es-MX", { weekday: "long" });
    document.getElementById("comida-a-cambiar").textContent = `Cambiar platillo · ${NOMBRE_COMIDA[tipo]} del ${nombreDia}`;
    document.getElementById("platillo-actual").textContent = actual.titulo;
    document.getElementById("kcal-actual").textContent = `${formatoNumero(actual.calorias)} kcal`;

    const opciones = document.getElementById("opciones");
    opciones.innerHTML = "";
    opciones.appendChild(crear("p", "", "Buscando opciones…"));
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
        // Ya vienen ordenadas del backend
        const recetas = (await recetasDe(tipo))
            .filter((receta) => receta.receta_id !== actual.receta_id)
            .slice(0, 3);

        opciones.innerHTML = "";
        if (recetas.length === 0) {
            opciones.appendChild(crear("p", "", "No hay otras recetas de este tipo."));
            return;
        }
        recetas.forEach((receta) => opciones.appendChild(crearOpcion(receta)));
    } catch (error) {
        opciones.innerHTML = "";
        opciones.appendChild(crear("p", "", `No pudimos cargar opciones. ${error.message}`));
    }
}

function cerrarCambio() {
    panel.hidden = true;
    cambio = null;
    opcionElegida = null;
    document.querySelectorAll(".comida-seleccionada").forEach((fila) => fila.classList.remove("comida-seleccionada"));
}

document.getElementById("boton-dejar").addEventListener("click", cerrarCambio);

botonConfirmar.addEventListener("click", async () => {
    if (!cambio || !opcionElegida) return;

    botonConfirmar.disabled = true;
    botonConfirmar.textContent = "Guardando…";

    try {
        // El backend arma la comida nueva y recalcula el total
        menu = await cambiarPlatillo(USUARIO_ID, SEMANA, cambio.indiceDia, cambio.tipo, opcionElegida.receta_id);
        cerrarCambio();
        pintarSemana(menu, abrirCambio);
        pintarResumen(perfilUsuario);
    } catch (error) {
        mostrarErrorPagina(`No pudimos cambiar el platillo. ${error.message}`);
        botonConfirmar.disabled = false;
    } finally {
        botonConfirmar.textContent = "Cambiar platillo";
    }
});

// ---------- Cargar ----------

let perfilUsuario = null;

async function cargarMenu() {
    try {
        const [usuario, ultimoEscaneo, menuSemana] = await Promise.all([
            obtenerUsuario(USUARIO_ID),
            obtenerUltimoEscaneo(USUARIO_ID),
            obtenerMenu(USUARIO_ID, SEMANA)
        ]);
        perfilUsuario = usuario;
        escaneo = ultimoEscaneo;
        menu = menuSemana;
        ponerAvatar(usuario);

        if (!menu || !menu.dias || menu.dias.length === 0) {
            pintarIngredientes();
            mostrarSinMenu(escaneo);
            return;
        }

        pintarResumen(usuario);
        pintarSemana(menu, abrirCambio);
    } catch (error) {
        mostrarErrorPagina(`No pudimos cargar tu menú. ${error.message}`);
    }
}

cargarMenu();
