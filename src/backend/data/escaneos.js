const { PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = require("./dynamo");

const TABLA = "escaneos";

async function guardar(escaneo) {
    await dynamo.send(new PutCommand({ TableName: TABLA, Item: escaneo }));
}

// El más reciente: query por usuario, de la fecha más nueva a la más vieja, solo 1
async function obtenerUltimo(usuarioId) {
    const resultado = await dynamo.send(new QueryCommand({
        TableName: TABLA,
        KeyConditionExpression: "usuario_id = :id",
        ExpressionAttributeValues: { ":id": usuarioId },
        ScanIndexForward: false,
        Limit: 1
    }));
    return resultado.Items[0];
}

module.exports = { guardar, obtenerUltimo };
