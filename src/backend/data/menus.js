const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = require("./dynamo");

const TABLA = "menus";

async function obtener(usuarioId, semana) {
    const resultado = await dynamo.send(new GetCommand({
        TableName: TABLA,
        Key: { usuario_id: usuarioId, semana: semana }
    }));
    return resultado.Item;
}

async function guardar(menu) {
    await dynamo.send(new PutCommand({ TableName: TABLA, Item: menu }));
}

module.exports = { obtener, guardar };
