const menus = require("../data/menus");

// GET /menus/:usuario_id/:semana
async function obtener(req, res) {
    const menu = await menus.obtener(req.params.usuario_id, req.params.semana);
    if (!menu) return res.status(404).json({ error: "No hay menú esa semana." });
    res.json(menu);
}

// PUT /menus/:usuario_id/:semana (cuando cambian un platillo)
async function actualizar(req, res) {
    if (!req.body.dias || req.body.dias.length !== 7) {
        return res.status(400).json({ error: "dias debe tener los 7 días." });
    }

    const menu = {
        usuario_id: req.params.usuario_id,
        semana: req.params.semana,
        dias: req.body.dias
    };
    await menus.guardar(menu);
    res.json(menu);
}

module.exports = { obtener, actualizar };
