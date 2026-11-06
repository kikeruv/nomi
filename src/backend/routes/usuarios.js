const express = require("express");
const controller = require("../controllers/usuarios");

const router = express.Router();

router.get("/:usuario_id", controller.obtener);
router.post("/", controller.crear);
router.put("/:usuario_id", controller.actualizar);

module.exports = router;
