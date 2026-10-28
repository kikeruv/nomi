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
    # Tabla de Registro de Calorias
    {
        "TableName": "calorias",
        "KeySchema": [
            {"AttributeName": "usuario_id", "KeyType": "HASH"},
            {"AttributeName": "fecha_comida", "KeyType": "RANGE"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "usuario_id", "AttributeType": "S"},
            {"AttributeName": "fecha_comida", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    },
    # Tabla de Planes semanales
    {
        "TableName": "plan",
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
    # Tabla de Historial de recetas
    {
        "TableName": "historial",
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
    for config in TABLAS_DIAGRAMA:
        nombre_tabla = config["TableName"]
        print(f"Creando tabla: '{nombre_tabla}'...")
        tabla = dynamodb.create_table(**config)
        
        print(f"Esperando a que '{nombre_tabla}' esté activa...")
        tabla.wait_until_exists()
        print(f"Tabla '{nombre_tabla}' creada con éxito\n")

if __name__ == "__main__":
    crear_tablas_nutricion()