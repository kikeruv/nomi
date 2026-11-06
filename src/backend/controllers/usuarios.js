const usuarios = require("../data/usuarios");

// GET /usuarios/:usuario_id
async function obtener(req, res) {
    const usuario = await usuarios.obtener(req.params.usuario_id);
    if (!usuario) return res.status(404).json({ error: "El usuario no existe." });
    res.json(usuario);
}

// POST /usuarios
async function crear(req, res) {
    const usuario = req.body;
    if (!usuario.usuario_id || !usuario.nombre || !usuario.correo || !usuario.personas) {
        return res.status(400).json({ error: "Faltan usuario_id, nombre, correo o personas." });
    }
    if (await usuarios.obtener(usuario.usuario_id)) {
        return res.status(409).json({ error: "Ese usuario ya existe." });
    }

    await usuarios.guardar(usuario);
    res.status(201).json(usuario);
}

// PUT /usuarios/:usuario_id (junta lo que ya tenía con los cambios)
async function actualizar(req, res) {
    const usuario = await usuarios.obtener(req.params.usuario_id);
    if (!usuario) return res.status(404).json({ error: "El usuario no existe." });

    const actualizado = { ...usuario, ...req.body, usuario_id: usuario.usuario_id };

    // Un campo en null se borra (ej. quitar la meta de calorías)
    Object.keys(actualizado).forEach((campo) => {
        if (actualizado[campo] === null) delete actualizado[campo];
    });

    await usuarios.guardar(actualizado);
    res.json(actualizado);
}

module.exports = { obtener, crear, actualizar };
