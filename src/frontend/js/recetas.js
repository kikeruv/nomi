const CALORIAS_RESTANTES = 1170;   // Temporal: en la final se calcula con la meta y lo registrado hoy

let categoriaElegida = "todas";
let soloLasQueCaben = false;

const NOMBRE_CATEGORIA = {
    desayuno: "Desayuno",
    comida: "Comida",
    cena: "Cena"
};

function formatoNumero(numero) {
    return Number(numero).toLocaleString("es-MX");
}

// Devuelve las recetas que cumplen con todos los filtros activos
function recetasFiltradas() {
    const busqueda = document.getElementById("buscador").value.trim().toLowerCase();

    return RECETAS.filter((receta) => {
        const coincideCategoria = categoriaElegida === "todas" || receta.categoria === categoriaElegida;
        const coincideBusqueda =
            receta.titulo.toLowerCase().includes(busqueda) ||
            receta.ingredientes.some((ingrediente) => ingrediente.nombre.toLowerCase().includes(busqueda));
        const cabe = !soloLasQueCaben || receta.calorias <= CALORIAS_RESTANTES;

        return coincideCategoria && coincideBusqueda && cabe;
    });
}

function pintarRecetas() {
    const contenedor = document.getElementById("lista-recetas");
    const recetas = recetasFiltradas();

    if (recetas.length === 0) {
        contenedor.innerHTML = `<div class="tarjeta"><p>No encontramos recetas con esos filtros.</p></div>`;
        return;
    }

    // Cada tarjeta lleva a receta.html con las dos llaves de la tabla: categoria y receta_id
    contenedor.innerHTML = recetas.map((receta) => `
        <a class="tarjeta" href="receta.html?categoria=${receta.categoria}&receta_id=${receta.receta_id}" style="color: inherit; text-decoration: none">
            <div class="imagen-receta"><i></i></div>
            <h3>${receta.titulo}</h3>
            <p>${receta.tiempo_min} min · ${receta.porciones} ${receta.porciones === 1 ? "porción" : "porciones"}</p>
            <p>
                <span class="kcal">${formatoNumero(receta.calorias)} kcal</span>
                <span class="chip">${NOMBRE_CATEGORIA[receta.categoria]}</span>
            </p>
        </a>`).join("");
}

// Filtros de categoría
document.querySelectorAll(".filtro").forEach((boton) => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach((otro) => otro.setAttribute("aria-pressed", "false"));
        boton.setAttribute("aria-pressed", "true");
        categoriaElegida = boton.dataset.categoria;
        pintarRecetas();
    });
});

// Buscador: filtra mientras escribes
document.getElementById("buscador").addEventListener("input", pintarRecetas);

// "Ver solo las que caben" funciona como interruptor
const enlaceCaben = document.getElementById("solo-caben");
enlaceCaben.addEventListener("click", (evento) => {
    evento.preventDefault();
    soloLasQueCaben = !soloLasQueCaben;
    enlaceCaben.textContent = soloLasQueCaben ? "Ver todas →" : "Ver solo las que caben →";
    pintarRecetas();
});

pintarRecetas();