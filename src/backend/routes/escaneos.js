const express = require("express");
const controller = require("../controllers/escaneos");

const router = express.Router();

router.post("/", controller.crear);
router.get("/:usuario_id/ultimo", controller.obtenerUltimo);

module.exports = router;
