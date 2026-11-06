const express = require("express");
const controller = require("../controllers/menus");

const router = express.Router();

router.get("/:usuario_id/:semana", controller.obtener);
router.put("/:usuario_id/:semana", controller.actualizar);

module.exports = router;
