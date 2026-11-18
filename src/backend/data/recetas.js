const { GetCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = require("./dynamo");

const TABLA = "recetario";

async function obtener(recetaId) {
    const resultado = await dynamo.send(new GetCommand({
        TableName: TABLA,
        Key: { receta_id: recetaId }
    }));
    return resultado.Item;
}

async function obtenerTodas() {
    const resultado = await dynamo.send(new ScanCommand({ TableName: TABLA }));
    return resultado.Items;
}

// Usa el índice de categoría (query en vez de scan)
async function obtenerPorCategoria(categoria) {
    const resultado = await dynamo.send(new QueryCommand({
        TableName: TABLA,
        IndexName: "CategoriaIndex",
        KeyConditionExpression: "categoria = :categoria",
        ExpressionAttributeValues: { ":categoria": categoria }
    }));
    return resultado.Items;
}

module.exports = { obtener, obtenerTodas, obtenerPorCategoria };
