// API de Nomi
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Para saber si la API está viva
app.get("/", (req, res) => {
    res.json({ ok: true });
});

app.use("/usuarios", require("./routes/usuarios"));
app.use("/escaneos", require("./routes/escaneos"));
app.use("/menus", require("./routes/menus"));
app.use("/recetas", require("./routes/recetas"));

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
    console.log(`API corriendo en el puerto ${puerto}`);
});
