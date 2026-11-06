const express = require("express");
const controller = require("../controllers/recetas");

const router = express.Router();

router.get("/", controller.obtenerTodas);
router.get("/:receta_id", controller.obtener);

module.exports = router;
