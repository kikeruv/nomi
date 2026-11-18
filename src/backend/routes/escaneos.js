const express = require("express");
const sesion = require("../middlewares/sesion");
const controller = require("../controllers/escaneos");

const router = express.Router();

router.post("/", sesion, controller.crear);
router.get("/:usuario_id/ultimo", sesion, controller.obtenerUltimo);

module.exports = router;
