const express = require("express");
const sesion = require("../middlewares/sesion");
const controller = require("../controllers/usuarios");

const router = express.Router();

router.get("/:usuario_id", sesion, controller.obtener);
router.post("/", sesion, controller.crear);
router.put("/:usuario_id", sesion, controller.actualizar);

module.exports = router;
