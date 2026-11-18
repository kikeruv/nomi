const usuarios = require("../data/usuarios");
const escaneos = require("../data/escaneos");
const menus = require("../data/menus");
const recetas = require("../data/recetas");
const { fechaHora, generarMenu } = require("../utils/menu");

// POST /escaneos: guarda el escaneo y arma el menú de la semana
async function crear(req, res) {
    const datos = req.body;
    if (!datos.usuario_id) return res.status(400).json({ error: "Falta usuario_id." });
    if (!(datos.personas >= 1)) return res.status(400).json({ error: "Escribe al menos 1 persona." });
    if (![1, 2, 3].includes(datos.comidas_por_dia)) return res.status(400).json({ error: "Elige de 1 a 3 comidas por día." });
    if (!datos.ingredientes || datos.ingredientes.length === 0) {
        return res.status(400).json({ error: "Agrega al menos un ingrediente." });
    }

    // Nombres en minúsculas para encontrar vacíos y repetidos
    const nombres = datos.ingredientes.map((ingrediente) => (ingrediente.nombre || "").trim().toLowerCase());
    if (nombres.includes("")) return res.status(400).json({ error: "Hay un ingrediente sin nombre." });
    if (new Set(nombres).size !== nombres.length) return res.status(400).json({ error: "Hay ingredientes repetidos." });

    const usuario = await usuarios.obtener(datos.usuario_id);
    if (!usuario) return res.status(404).json({ error: "El usuario no existe." });

    const escaneo = {
        usuario_id: datos.usuario_id,
        fecha: fechaHora(new Date()),
        personas: datos.personas,
        comidas_por_dia: datos.comidas_por_dia,
        ingredientes: datos.ingredientes
    };
    await escaneos.guardar(escaneo);

    const menu = generarMenu(usuario, escaneo, await recetas.obtenerTodas());
    await menus.guardar(menu);

    res.status(201).json({ ...escaneo, semana: menu.semana });
}

// GET /escaneos/:usuario_id/ultimo
async function obtenerUltimo(req, res) {
    const escaneo = await escaneos.obtenerUltimo(req.params.usuario_id);
    if (!escaneo) return res.status(404).json({ error: "No hay escaneos." });

    res.json(escaneo);
}

module.exports = { crear, obtenerUltimo };
