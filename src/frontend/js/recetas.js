// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();

// Recetas (el backend las manda ordenadas por lo que tienes en el refri)

const NOMBRE_CATEGORIA = { desayuno: "Desayuno", comida: "Comida", cena: "Cena" };
const LIMITE_KCAL = 500;

let recetas = [];
let soloLigeras = false;

const contenedor = document.getElementById("lista-recetas");
const buscador = document.getElementById("buscador");
const enlaceLigeras = document.getElementById("solo-caben");

function crearTarjeta(receta) {
    const tarjeta = crear("a", "tarjeta");
    tarjeta.href = `receta.html?receta_id=${encodeURIComponent(receta.receta_id)}`;
    tarjeta.style.color = "inherit";
    tarjeta.style.textDecoration = "none";

    // Foto o círculo vacío
    const imagen = crear("div", "imagen-receta");
    if (receta.imagen_url) {
        const img = crear("img");
        img.src = receta.imagen_url;
        img.alt = receta.titulo;
        img.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: inherit";
        imagen.appendChild(img);
    } else {
        imagen.appendChild(crear("i"));
    }

    let detalle = `${receta.tiempo_min} min`;
    // en_refri lo calcula el backend (null si no has escaneado)
    if (receta.en_refri) detalle += ` · ${receta.en_refri.length} de ${receta.ingredientes.length} en tu refri`;

    const datos = crear("p");
    datos.style.cssText = "display: flex; gap: 8px; align-items: center; flex-wrap: wrap";
    datos.appendChild(crear("span", "kcal", `${formatoNumero(receta.calorias)} kcal / porción`));
    if (receta.en_refri && receta.en_refri.length === receta.ingredientes.length) {
        datos.appendChild(crear("span", "chip", "Usa tu refri"));
    } else {
        datos.appendChild(crear("span", "chip", NOMBRE_CATEGORIA[receta.categoria] || receta.categoria));
    }

    tarjeta.append(imagen, crear("h3", "", receta.titulo), crear("p", "", detalle), datos);
    return tarjeta;
}

function pintarRecetas() {
    const busqueda = normalizar(buscador.value);

    const lista = recetas
        .filter((receta) => {
            const coincide = normalizar(receta.titulo).includes(busqueda) ||
                (receta.ingredientes || []).some((ingrediente) => normalizar(ingrediente.nombre).includes(busqueda));
            const ligera = !soloLigeras || Number(receta.calorias) < LIMITE_KCAL;
            return coincide && ligera;
        });

    contenedor.innerHTML = "";
    if (lista.length === 0) {
        const vacio = crear("div", "tarjeta");
        vacio.appendChild(crear("p", "", recetas.length === 0
            ? "Todavía no hay recetas en el recetario."
            : "No encontramos recetas con esos filtros."));
        contenedor.appendChild(vacio);
        return;
    }
    lista.forEach((receta) => contenedor.appendChild(crearTarjeta(receta)));
}

async function cargarRecetas(categoria) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crear("p", "", "Cargando recetas…"));
    try {
        recetas = (await obtenerRecetas(categoria === "todas" ? "" : categoria)) || [];
        pintarRecetas();
    } catch (error) {
        contenedor.innerHTML = "";
        mostrarErrorPagina(`No pudimos cargar las recetas. ${error.message}`);
    }
}

// Filtros de categoría
document.querySelectorAll(".filtro").forEach((boton) => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach((otro) => otro.setAttribute("aria-pressed", "false"));
        boton.setAttribute("aria-pressed", "true");
        cargarRecetas(boton.dataset.categoria);
    });
});

// Buscador: filtra mientras escribes
buscador.addEventListener("input", pintarRecetas);

// Botón "Menos de 500 kcal"
enlaceLigeras.addEventListener("click", (evento) => {
    evento.preventDefault();
    soloLigeras = !soloLigeras;
    enlaceLigeras.textContent = soloLigeras ? "Ver todas →" : `Menos de ${LIMITE_KCAL} kcal →`;
    pintarRecetas();
});

async function iniciar() {
    ponerAvatar(await obtenerUsuario(USUARIO_ID));
    cargarRecetas("todas");
}

iniciar();
