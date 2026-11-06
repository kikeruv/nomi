// API de Nomi: API Gateway -> este contenedor en EC2 -> DynamoDB y S3

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Para revisar que la API está viva
app.get("/", (req, res) => {
    res.json({ ok: true });
});

app.use("/usuarios", require("./routes/usuarios"));
app.use("/escaneos", require("./routes/escaneos"));
app.use("/menus", require("./routes/menus"));
app.use("/recetas", require("./routes/recetas"));

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
    console.log(`API corriendo en http://localhost:${puerto}`);
});
