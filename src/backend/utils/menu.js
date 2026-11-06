// Fechas y armado del menú de la semana

// "2026-11-05"
function fecha(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2026-11-05T13:45:00" (la SK de escaneos)
function fechaHora(d) {
    return `${fecha(d)}T${d.toTimeString().slice(0, 8)}`;
}

// "2026-W45" (la SK de menus; igual que en la página)
function semanaISO(d) {
    const jueves = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    jueves.setUTCDate(jueves.getUTCDate() + 4 - (jueves.getUTCDay() || 7));
    const inicioAnio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1));
    const numero = Math.ceil(((jueves - inicioAnio) / 86400000 + 1) / 7);
    return `${jueves.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

// "Plátano" -> "platano"
function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Cuántos ingredientes de la receta hay en el refri
function enRefri(receta, ingredientesRefri) {
    const delRefri = ingredientesRefri.map((ingrediente) => normalizar(ingrediente.nombre));
    return receta.ingredientes.filter((ingrediente) =>
        delRefri.some((nombre) => normalizar(ingrediente.nombre).includes(nombre))
    ).length;
}

// 1 comida = solo comida, 2 = comida y cena, 3 = las tres
const TIPOS = { 1: ["comida"], 2: ["comida", "cena"], 3: ["desayuno", "comida", "cena"] };
const NOMBRES_DIA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// Arma 7 días: primero las recetas que más usan el refri y que caben en el tiempo máximo
function generarMenu(usuario, escaneo, recetas) {
    const tipos = TIPOS[escaneo.comidas_por_dia];
    const tiempoMaximo = usuario.tiempo_max_min || 999;

    // Recetas de cada tipo, ordenadas de la que más usa el refri a la que menos
    const opciones = {};
    tipos.forEach((tipo) => {
        let lista = recetas.filter((receta) => receta.categoria === tipo);
        const rapidas = lista.filter((receta) => receta.tiempo_min <= tiempoMaximo);
        if (rapidas.length > 0) lista = rapidas;

        opciones[tipo] = lista.sort((a, b) =>
            enRefri(b, escaneo.ingredientes) / b.ingredientes.length -
            enRefri(a, escaneo.ingredientes) / a.ingredientes.length
        );
    });

    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

    const dias = NOMBRES_DIA.map((nombre, i) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);

        const comidas = {};
        let total = 0;

        tipos.forEach((tipo) => {
            if (opciones[tipo].length === 0) return;

            // Va rotando para no repetir el mismo platillo toda la semana
            const receta = opciones[tipo][i % opciones[tipo].length];
            comidas[tipo] = {
                receta_id: receta.receta_id,
                titulo: receta.titulo,
                calorias: receta.calorias,
                tiempo_min: receta.tiempo_min,
                proteina_g: receta.proteina_g,
                carbs_g: receta.carbs_g,
                grasa_g: receta.grasa_g,
                usa_refri: enRefri(receta, escaneo.ingredientes) === receta.ingredientes.length
            };
            total += receta.calorias;
        });

        return { dia: nombre, fecha: fecha(dia), total_kcal: total, comidas: comidas };
    });

    return { usuario_id: usuario.usuario_id, semana: semanaISO(hoy), dias: dias };
}

module.exports = { fechaHora, generarMenu };
