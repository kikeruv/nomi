const recetas = require("../data/recetas");
const escaneos = require("../data/escaneos");
const { urlFirmada } = require("../data/imagenes");
const { ingredientesQueTienes } = require("../utils/menu");

// Agrega la foto y los ingredientes que tienes (null si no hay escaneo)
async function completar(receta, escaneo) {
    return {
        ...receta,
        imagen_url: await urlFirmada(receta.imagen),
        en_refri: escaneo ? ingredientesQueTienes(receta, escaneo.ingredientes) : null
    };
}

// GET /recetas o /recetas?categoria=desayuno
// Primero las que más ingredientes tienes en tu refri
async function obtenerTodas(req, res) {
    const lista = req.query.categoria
        ? await recetas.obtenerPorCategoria(req.query.categoria)
        : await recetas.obtenerTodas();
    const escaneo = await escaneos.obtenerUltimo(req.usuarioId);

    const completas = await Promise.all(lista.map((receta) => completar(receta, escaneo)));
    completas.sort((a, b) => (b.en_refri || []).length - (a.en_refri || []).length);
    res.json(completas);
}

// GET /recetas/:receta_id
async function obtener(req, res) {
    const receta = await recetas.obtener(req.params.receta_id);
    if (!receta) return res.status(404).json({ error: "La receta no existe." });

    const escaneo = await escaneos.obtenerUltimo(req.usuarioId);
    res.json(await completar(receta, escaneo));
}

module.exports = { obtenerTodas, obtener };
