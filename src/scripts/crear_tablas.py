import boto3

dynamodb = boto3.resource('dynamodb')

# Lista de todas las tablas basadas en tu diagrama
TABLAS_DIAGRAMA = [
    # Tabla de usuarios
    {
        "TableName": "usuarios",
        "KeySchema": [
            {"AttributeName": "usuario_id", "KeyType": "HASH"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "usuario_id", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    },
    # Tabla de Escaneos del refri
    {
        "TableName": "escaneos",
        "KeySchema": [
            {"AttributeName": "usuario_id", "KeyType": "HASH"},
            {"AttributeName": "fecha", "KeyType": "RANGE"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "usuario_id", "AttributeType": "S"},
            {"AttributeName": "fecha", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    },
    # Tabla de Menus semanales
    {
        "TableName": "menus",
        "KeySchema": [
            {"AttributeName": "usuario_id", "KeyType": "HASH"},
            {"AttributeName": "semana", "KeyType": "RANGE"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "usuario_id", "AttributeType": "S"},
            {"AttributeName": "semana", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    },
    # Tabla de recetario
    {
        "TableName": "recetario",
        "KeySchema": [
            {"AttributeName": "receta_id", "KeyType": "HASH"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "receta_id", "AttributeType": "S"},
            {"AttributeName": "categoria", "AttributeType": "S"} # Requerido para el GSI
        ],
        "BillingMode": "PAY_PER_REQUEST",
        # Definición del GSI que se muestra en la tabla Recetario de tu diagrama
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "CategoriaIndex",
                "KeySchema": [
                    {"AttributeName": "categoria", "KeyType": "HASH"}
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                }
            }
        ]
    }
]

def crear_tablas_nutricion():
    # Tablas que ya existen en AWS (para no intentar crearlas otra vez)
    existentes = [tabla.name for tabla in dynamodb.tables.all()]

    for config in TABLAS_DIAGRAMA:
        nombre_tabla = config["TableName"]
        if nombre_tabla in existentes:
            print(f"La tabla '{nombre_tabla}' ya existe, se salta\n")
            continue

        print(f"Creando tabla: '{nombre_tabla}'...")
        tabla = dynamodb.create_table(**config)
        
        print(f"Esperando a que '{nombre_tabla}' esté activa...")
        tabla.wait_until_exists()
        print(f"Tabla '{nombre_tabla}' creada con éxito\n")

if __name__ == "__main__":
    crear_tablas_nutricion()
