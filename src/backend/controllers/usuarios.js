const usuarios = require("../data/usuarios");

// Revisa los datos del perfil, regresa el error o null
function revisarPerfil(datos) {
    if (datos.nombre !== undefined && !datos.nombre) return "Escribe tu nombre.";
    if (datos.correo !== undefined && !String(datos.correo).includes("@")) return "Revisa tu correo, le falta la @.";
    if (datos.personas !== undefined && !(datos.personas >= 1)) return "Escribe al menos 1 persona.";
    if (datos.comidas_por_dia !== undefined && ![1, 2, 3].includes(datos.comidas_por_dia)) return "Elige de 1 a 3 comidas por día.";

    // Estos pueden ir vacíos
    if (datos.tiempo_max_min && !(datos.tiempo_max_min > 0)) return "Los minutos deben ser mayores a 0.";
    if (datos.meta_calorias && !(datos.meta_calorias > 0)) return "La meta de calorías debe ser mayor a 0.";
    if (datos.meta_proteina && !(datos.meta_proteina > 0)) return "La meta de proteína debe ser mayor a 0.";
    return null;
}

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
        return res.status(400).json({ error: "Faltan nombre, correo o personas." });
    }

    const error = revisarPerfil(usuario);
    if (error) return res.status(400).json({ error: error });

    if (await usuarios.obtener(usuario.usuario_id)) {
        return res.status(409).json({ error: "Ese usuario ya existe." });
    }

    await usuarios.guardar(usuario);
    res.status(201).json(usuario);
}

// PUT /usuarios/:usuario_id
async function actualizar(req, res) {
    const usuario = await usuarios.obtener(req.params.usuario_id);
    if (!usuario) return res.status(404).json({ error: "El usuario no existe." });

    const error = revisarPerfil(req.body);
    if (error) return res.status(400).json({ error: error });

    // Junta lo que tenía con los cambios (el id no se cambia)
    const actualizado = { ...usuario, ...req.body, usuario_id: usuario.usuario_id };

    // Si un campo viene en null se borra (ej. quitar la meta)
    Object.keys(actualizado).forEach((campo) => {
        if (actualizado[campo] === null) delete actualizado[campo];
    });

    await usuarios.guardar(actualizado);
    res.json(actualizado);
}

module.exports = { obtener, crear, actualizar };
