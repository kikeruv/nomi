// Detalle de una receta: lee ?receta_id= de la URL y usa GET /recetas/{receta_id}

const NOMBRE_CATEGORIA = { desayuno: "Desayuno", comida: "Comida", cena: "Cena" };

function mostrarNoEncontrada() {
    document.getElementById("contenido-receta").hidden = true;
    document.getElementById("no-encontrada").hidden = false;
}

function pintarReceta(receta, escaneo) {
    document.title = `${receta.titulo} · Nomi`;

    document.getElementById("categoria").textContent = NOMBRE_CATEGORIA[receta.categoria] || receta.categoria;
    document.getElementById("titulo").textContent = receta.titulo;
    document.getElementById("descripcion").textContent = receta.descripcion || "";
    document.getElementById("calorias").textContent = formatoNumero(receta.calorias);
    document.getElementById("tiempo").innerHTML = `${Number(receta.tiempo_min)}<small> min</small>`;
    document.getElementById("porciones").textContent = receta.porciones;

    // Foto de S3 (URL firmada)
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

    // Cuántos ingredientes tienes en el refri
    const enRefri = ingredientesEnRefri(receta, escaneo);
    if (escaneo) {
        document.getElementById("del-refri").innerHTML = `${enRefri.tengo}<small> de ${enRefri.total}</small>`;
        if (enRefri.total > 0 && enRefri.tengo === enRefri.total) {
            document.getElementById("chips").appendChild(crear("span", "chip", "Usa tu refri"));
        }
    }

    // Pasos: un <li> por paso (la numeración 01, 02… la pone el CSS)
    const listaPasos = document.getElementById("pasos");
    (receta.pasos || []).forEach((paso) => listaPasos.appendChild(crear("li", "", paso)));

    // Ingredientes: nombre (con ✓ si está en tu refri) y cantidad
    const listaIngredientes = document.getElementById("ingredientes");
    (receta.ingredientes || []).forEach((ingrediente) => {
        const tengo = enRefri.nombres.includes(ingrediente.nombre);
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
        const [receta, escaneo, usuario] = await Promise.all([
            obtenerReceta(recetaId),
            obtenerUltimoEscaneo(CONFIG.USUARIO_ID).catch(() => null),
            obtenerUsuario(CONFIG.USUARIO_ID).catch(() => null)
        ]);
        ponerAvatar(usuario);

        if (!receta) {
            mostrarNoEncontrada();
            return;
        }
        pintarReceta(receta, escaneo);
    } catch (error) {
        mostrarNoEncontrada();
        document.querySelector("#no-encontrada p").textContent = `No pudimos cargar la receta. ${error.message}`;
    }
}

cargarReceta();
