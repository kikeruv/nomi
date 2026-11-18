// Revisa que cada quien solo vea sus datos
// (el token ya lo validó Cognito en API Gateway)
function sesion(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Falta iniciar sesión." });

    // El token tiene 3 partes separadas por punto; la de en medio trae los datos
    const datos = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    const usuarioId = req.params.usuario_id || (req.body && req.body.usuario_id);

    // sub = id del usuario en Cognito
    if (usuarioId && usuarioId !== datos.sub) {
        return res.status(403).json({ error: "No puedes ver datos de otro usuario." });
    }
    req.usuarioId = datos.sub;
    next();
}

module.exports = sesion;
