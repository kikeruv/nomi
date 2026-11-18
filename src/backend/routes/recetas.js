const express = require("express");
const sesion = require("../middlewares/sesion");
const controller = require("../controllers/recetas");

const router = express.Router();

router.get("/", sesion, controller.obtenerTodas);
router.get("/:receta_id", sesion, controller.obtener);

module.exports = router;
