const recetas = require("../data/recetas");
const { urlFirmada } = require("../data/imagenes");

// Le agrega a la receta la URL de su foto en S3
async function conImagen(receta) {
    return { ...receta, imagen_url: await urlFirmada(receta.imagen) };
}

// GET /recetas y GET /recetas?categoria=desayuno
async function obtenerTodas(req, res) {
    const lista = req.query.categoria
        ? await recetas.obtenerPorCategoria(req.query.categoria)
        : await recetas.obtenerTodas();

    res.json(await Promise.all(lista.map(conImagen)));
}

// GET /recetas/:receta_id
async function obtener(req, res) {
    const receta = await recetas.obtener(req.params.receta_id);
    if (!receta) return res.status(404).json({ error: "La receta no existe." });

    res.json(await conImagen(receta));
}

module.exports = { obtenerTodas, obtener };
