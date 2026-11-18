// Fechas y menú de la semana

// "2026-11-05"
function fecha(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2026-11-05T13:45:00" (SK de escaneos)
function fechaHora(d) {
    return `${fecha(d)}T${d.toTimeString().slice(0, 8)}`;
}

// "2026-W45" (SK de menus); la semana es la de su jueves
function semanaISO(d) {
    const jueves = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    jueves.setUTCDate(jueves.getUTCDate() + 4 - (jueves.getUTCDay() || 7));
    const inicioAnio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1));
    const numero = Math.ceil(((jueves - inicioAnio) / 86400000 + 1) / 7);
    return `${jueves.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

// "Plátano" -> "platano"
function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Ingredientes de la receta que sí hay en el refri
function ingredientesQueTienes(receta, ingredientesRefri) {
    const delRefri = ingredientesRefri.map((ingrediente) => normalizar(ingrediente.nombre));
    return receta.ingredientes
        .map((ingrediente) => ingrediente.nombre)
        .filter((nombre) => delRefri.some((otro) => normalizar(nombre).includes(otro) || otro.includes(normalizar(nombre))));
}

// Una comida del menú (copia los datos de la receta)
function comidaDe(receta, ingredientesRefri) {
    return {
        receta_id: receta.receta_id,
        titulo: receta.titulo,
        calorias: receta.calorias,
        tiempo_min: receta.tiempo_min,
        proteina_g: receta.proteina_g,
        carbs_g: receta.carbs_g,
        grasa_g: receta.grasa_g,
        usa_refri: ingredientesQueTienes(receta, ingredientesRefri).length === receta.ingredientes.length
    };
}

// Suma las calorías de las comidas de un día
function totalKcal(comidas) {
    return Object.values(comidas).reduce((suma, comida) => suma + comida.calorias, 0);
}

// Qué comidas lleva cada día según comidas_por_dia
const TIPOS = { 1: ["comida"], 2: ["comida", "cena"], 3: ["desayuno", "comida", "cena"] };
const NOMBRES_DIA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// Arma los 7 días con las recetas que más usan tu refri
function generarMenu(usuario, escaneo, recetas) {
    const tipos = TIPOS[escaneo.comidas_por_dia];
    const tiempoMaximo = usuario.tiempo_max_min || 999;

    // Por tipo: primero las rápidas y las que más ingredientes tienes
    const opciones = {};
    tipos.forEach((tipo) => {
        let lista = recetas.filter((receta) => receta.categoria === tipo);
        const rapidas = lista.filter((receta) => receta.tiempo_min <= tiempoMaximo);
        if (rapidas.length > 0) lista = rapidas;

        // Porcentaje de la receta que ya tienes
        const porcentaje = (receta) => ingredientesQueTienes(receta, escaneo.ingredientes).length / receta.ingredientes.length;
        opciones[tipo] = lista.sort((a, b) => porcentaje(b) - porcentaje(a));
    });

    // Lunes de esta semana
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

    const dias = NOMBRES_DIA.map((nombre, i) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);

        const comidas = {};
        tipos.forEach((tipo) => {
            if (opciones[tipo].length === 0) return;
            // Rota las recetas para no repetir toda la semana
            comidas[tipo] = comidaDe(opciones[tipo][i % opciones[tipo].length], escaneo.ingredientes);
        });

        return { dia: nombre, fecha: fecha(dia), total_kcal: totalKcal(comidas), comidas: comidas };
    });

    return { usuario_id: usuario.usuario_id, semana: semanaISO(hoy), dias: dias };
}

module.exports = { fechaHora, generarMenu, comidaDe, totalKcal, ingredientesQueTienes };
