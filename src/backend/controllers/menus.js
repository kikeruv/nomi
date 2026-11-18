const menus = require("../data/menus");
const recetas = require("../data/recetas");
const escaneos = require("../data/escaneos");
const { comidaDe, totalKcal } = require("../utils/menu");

// GET /menus/:usuario_id/:semana
async function obtener(req, res) {
    const menu = await menus.obtener(req.params.usuario_id, req.params.semana);
    if (!menu) return res.status(404).json({ error: "No hay menú esa semana." });
    res.json(menu);
}

// PUT /menus/:usuario_id/:semana/:dia/:tipo  { receta_id }
// Cambia un platillo (dia: 0 = lunes ... 6 = domingo)
async function cambiarPlatillo(req, res) {
    const menu = await menus.obtener(req.params.usuario_id, req.params.semana);
    if (!menu) return res.status(404).json({ error: "No hay menú esa semana." });

    const dia = menu.dias[Number(req.params.dia)];
    const tipo = req.params.tipo;
    if (!dia || !dia.comidas[tipo]) return res.status(400).json({ error: "Ese día no tiene esa comida." });

    const receta = await recetas.obtener(req.body.receta_id);
    if (!receta) return res.status(404).json({ error: "La receta no existe." });
    if (receta.categoria !== tipo) return res.status(400).json({ error: "La receta no es de esa comida." });

    // usa_refri se calcula con el último escaneo
    const escaneo = await escaneos.obtenerUltimo(req.params.usuario_id);
    dia.comidas[tipo] = comidaDe(receta, escaneo ? escaneo.ingredientes : []);
    dia.total_kcal = totalKcal(dia.comidas);

    await menus.guardar(menu);
    res.json(menu);
}

module.exports = { obtener, cambiarPlatillo };
