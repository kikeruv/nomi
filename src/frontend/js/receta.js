const NOMBRE_CATEGORIA = {
    desayuno: "Desayuno",
    comida: "Comida",
    cena: "Cena"
};

// 1. Leer las dos llaves de la URL (igual que un get_item en DynamoDB necesita PK y SK)
const parametros = new URLSearchParams(window.location.search);
const categoria = parametros.get("categoria");
const recetaId = parametros.get("receta_id");

// 2. Buscar la receta
const receta = RECETAS.find((r) => r.categoria === categoria && r.receta_id === recetaId);

// 3. Mostrarla, o el aviso si no existe
if (!receta) {
    document.getElementById("contenido-receta").hidden = true;
    document.getElementById("no-encontrada").hidden = false;
} else {
    document.title = `${receta.titulo} · Nomi`;

    document.getElementById("categoria").textContent = NOMBRE_CATEGORIA[receta.categoria];
    document.getElementById("titulo").textContent = receta.titulo;
    document.getElementById("descripcion").textContent = receta.descripcion;
    document.getElementById("calorias").textContent = receta.calorias;
    document.getElementById("tiempo").innerHTML = `${receta.tiempo_min}<small> min</small>`;
    document.getElementById("porciones").textContent = receta.porciones;

    // Pasos: un <li> por paso (la numeración 01, 02… la pone el CSS)
    const listaPasos = document.getElementById("pasos");
    receta.pasos.forEach((paso) => {
        const li = document.createElement("li");
        li.textContent = paso;
        listaPasos.appendChild(li);
    });

    // Ingredientes: nombre a la izquierda y cantidad a la derecha
    const listaIngredientes = document.getElementById("ingredientes");
    receta.ingredientes.forEach((ingrediente) => {
        const li = document.createElement("li");
        const nombre = document.createElement("span");
        const cantidad = document.createElement("span");
        nombre.textContent = ingrediente.nombre;
        cantidad.textContent = ingrediente.cantidad;
        li.append(nombre, cantidad);
        listaIngredientes.appendChild(li);
    });
}