const usuarios = require("../data/usuarios");
const escaneos = require("../data/escaneos");
const menus = require("../data/menus");
const recetas = require("../data/recetas");
const { urlFirmada } = require("../data/imagenes");
const { fechaHora, generarMenu } = require("../utils/menu");

// POST /escaneos: guarda el escaneo y arma el menú de la semana
async function crear(req, res) {
    const datos = req.body;
    if (!datos.usuario_id || !datos.personas || !datos.ingredientes || datos.ingredientes.length === 0) {
        return res.status(400).json({ error: "Faltan usuario_id, personas o ingredientes." });
    }
    if (!(datos.comidas_por_dia >= 1 && datos.comidas_por_dia <= 3)) {
        return res.status(400).json({ error: "comidas_por_dia debe ser de 1 a 3." });
    }

    const usuario = await usuarios.obtener(datos.usuario_id);
    if (!usuario) return res.status(404).json({ error: "El usuario no existe." });

    const escaneo = {
        usuario_id: datos.usuario_id,
        fecha: fechaHora(new Date()),
        personas: datos.personas,
        comidas_por_dia: datos.comidas_por_dia,
        ingredientes: datos.ingredientes
    };
    if (datos.foto) escaneo.foto = datos.foto;
    await escaneos.guardar(escaneo);

    const menu = generarMenu(usuario, escaneo, await recetas.obtenerTodas());
    await menus.guardar(menu);

    res.status(201).json({ ...escaneo, semana: menu.semana });
}

// GET /escaneos/:usuario_id/ultimo
async function obtenerUltimo(req, res) {
    const escaneo = await escaneos.obtenerUltimo(req.params.usuario_id);
    if (!escaneo) return res.status(404).json({ error: "No hay escaneos." });

    res.json({ ...escaneo, foto_url: await urlFirmada(escaneo.foto) });
}

module.exports = { crear, obtenerUltimo };
