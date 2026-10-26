import os
import boto3
from dotenv import load_dotenv

load_dotenv()

dynamodb = boto3.resource("dynamodb")

tablas = []

# Esta es la tabla de Usuarios con la PK usuario_id
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_USUARIOS"),
    KeySchema=[
        {"AttributeName": "usuario_id", "KeyType": "HASH"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "usuario_id", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

# Esta es la tabla de RegistroCalorias con la PK usuario_id y SK fecha_comida
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_CALORIAS"),
    KeySchema=[
        {"AttributeName": "usuario_id", "KeyType": "HASH"},
        {"AttributeName": "fecha_comida", "KeyType": "RANGE"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "usuario_id", "AttributeType": "S"},
        {"AttributeName": "fecha_comida", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

# Esta es la tabla de HistorialRecetas con la PK usuario_id y SK fecha
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_HISTORIAL"),
    KeySchema=[
        {"AttributeName": "usuario_id", "KeyType": "HASH"},
        {"AttributeName": "fecha", "KeyType": "RANGE"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "usuario_id", "AttributeType": "S"},
        {"AttributeName": "fecha", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

# Esta es la tabla de PlanesSemanales con la PK usuario_id y SK semana
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_PLANES"),
    KeySchema=[
        {"AttributeName": "usuario_id", "KeyType": "HASH"},
        {"AttributeName": "semana", "KeyType": "RANGE"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "usuario_id", "AttributeType": "S"},
        {"AttributeName": "semana", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

# Esta es la tabla de Recetario con la PK categoria y SK receta_id
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_RECETARIO"),
    KeySchema=[
        {"AttributeName": "categoria", "KeyType": "HASH"},
        {"AttributeName": "receta_id", "KeyType": "RANGE"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "categoria", "AttributeType": "S"},
        {"AttributeName": "receta_id", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

# Esta es la tabla de Alimentos con la PK nombre
tablas.append(dynamodb.create_table(
    TableName=os.getenv("TABLA_ALIMENTOS"),
    KeySchema=[
        {"AttributeName": "nombre", "KeyType": "HASH"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "nombre", "AttributeType": "S"}
    ],
    BillingMode="PAY_PER_REQUEST"
))

for tabla in tablas:
    tabla.wait_until_exists()
    print(f"Tabla {tabla.name} creada")