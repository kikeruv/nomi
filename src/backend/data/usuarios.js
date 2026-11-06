const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = require("./dynamo");

const TABLA = "usuarios";

async function obtener(usuarioId) {
    const resultado = await dynamo.send(new GetCommand({
        TableName: TABLA,
        Key: { usuario_id: usuarioId }
    })); 
    return resultado.Item;
}

async function guardar(usuario) {
    await dynamo.send(new PutCommand({ TableName: TABLA, Item: usuario }));
}

module.exports = { obtener, guardar };
