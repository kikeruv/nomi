const express = require("express");
const sesion = require("../middlewares/sesion");
const controller = require("../controllers/menus");

const router = express.Router();

router.get("/:usuario_id/:semana", sesion, controller.obtener);
router.put("/:usuario_id/:semana/:dia/:tipo", sesion, controller.cambiarPlatillo);

module.exports = router;
