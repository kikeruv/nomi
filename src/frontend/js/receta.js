// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();

// Detalle de una receta

const NOMBRE_CATEGORIA = { desayuno: "Desayuno", comida: "Comida", cena: "Cena" };

function mostrarNoEncontrada() {
    document.getElementById("contenido-receta").hidden = true;
    document.getElementById("no-encontrada").hidden = false;
}

function pintarReceta(receta) {
    document.title = `${receta.titulo} · Nomi`;

    document.getElementById("categoria").textContent = NOMBRE_CATEGORIA[receta.categoria] || receta.categoria;
    document.getElementById("titulo").textContent = receta.titulo;
    document.getElementById("descripcion").textContent = receta.descripcion || "";
    document.getElementById("calorias").textContent = formatoNumero(receta.calorias);
    document.getElementById("tiempo").innerHTML = `${Number(receta.tiempo_min)}<small> min</small>`;
    document.getElementById("porciones").textContent = receta.porciones;

    // Foto
    if (receta.imagen_url) {
        const contenedorImagen = document.getElementById("imagen");
        const img = crear("img");
        img.src = receta.imagen_url;
        img.alt = receta.titulo;
        img.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: inherit";
        contenedorImagen.innerHTML = "";
        contenedorImagen.appendChild(img);
    }

    // Macros como chips
    const macros = document.getElementById("macros");
    [["proteina_g", "proteína"], ["carbs_g", "carbs"], ["grasa_g", "grasa"]].forEach(([campo, nombre]) => {
        if (receta[campo] !== undefined) macros.appendChild(crear("span", "chip", `${receta[campo]} g ${nombre}`));
    });

    // en_refri lo calcula el backend (null si no has escaneado)
    const enRefri = receta.en_refri || [];
    if (receta.en_refri) {
        document.getElementById("del-refri").innerHTML = `${enRefri.length}<small> de ${receta.ingredientes.length}</small>`;
        if (enRefri.length === receta.ingredientes.length) {
            document.getElementById("chips").appendChild(crear("span", "chip", "Usa tu refri"));
        }
    }

    // Pasos
    const listaPasos = document.getElementById("pasos");
    (receta.pasos || []).forEach((paso) => listaPasos.appendChild(crear("li", "", paso)));

    // Ingredientes (✓ si lo tienes)
    const listaIngredientes = document.getElementById("ingredientes");
    (receta.ingredientes || []).forEach((ingrediente) => {
        const tengo = enRefri.includes(ingrediente.nombre);
        const li = crear("li");
        li.append(crear("span", "", tengo ? `✓ ${ingrediente.nombre}` : ingrediente.nombre), crear("span", "", ingrediente.cantidad || ""));
        listaIngredientes.appendChild(li);
    });
}

async function cargarReceta() {
    const recetaId = new URLSearchParams(window.location.search).get("receta_id");
    if (!recetaId) {
        mostrarNoEncontrada();
        return;
    }

    try {
        const [receta, usuario] = await Promise.all([
            obtenerReceta(recetaId),
            obtenerUsuario(USUARIO_ID)
        ]);
        ponerAvatar(usuario);

        if (!receta) {
            mostrarNoEncontrada();
            return;
        }
        pintarReceta(receta);
    } catch (error) {
        mostrarNoEncontrada();
        document.querySelector("#no-encontrada p").textContent = `No pudimos cargar la receta. ${error.message}`;
    }
}

cargarReceta();
