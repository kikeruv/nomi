import boto3

dynamodb = boto3.resource("dynamodb")

# Referencias a las tablas basadas en tu diagrama
tabla_usuarios = dynamodb.Table("usuarios")
tabla_calorias = dynamodb.Table("calorias")
tabla_planes = dynamodb.Table("plan")
tabla_historial = dynamodb.Table("historial")
tabla_recetario = dynamodb.Table("recetario")

# Usuarios de prueba
usuarios = [
    {
        "usuario_id": "u1", 
        "nombre": "Enrique Ruvalcaba", 
        "edad": 22, 
        "correo": "enrique@gmail.com", 
        "presupuesto": 800, 
        "meta_calorias": 2000
    },
    {
        "usuario_id": "u2", 
        "nombre": "Alan Rodriguez", 
        "edad": 21, 
        "correo": "alan@gmail.com", 
        "presupuesto": 1200, 
        "meta_calorias": 2500
    },
]

# RegistroCalorias de prueba
calorias = [
    {
        "usuario_id": "u1", 
        "fecha_comida": "2026-10-25T08:30:00", 
        "platillo": "Avena con plátano", 
        "calorias_estimadas": 320, 
        "foto_key": "fotos/u1_avena.jpg"
    },
    {
        "usuario_id": "u2", 
        "fecha_comida": "2026-10-25T14:15:00", 
        "platillo": "Tacos de pescado", 
        "calorias_estimadas": 380, 
        "foto_key": "fotos/u2_tacos.jpg"
    },
]

# PlanesSemanales de prueba
plan = [
    {
        "usuario_id": "u1",
        "semana": "2026-10-25", # <-- Formato de fecha de inicio
        "presupuesto": 800,
        "menu": {"lunes": "Avena", "martes": "Tacos"},
        "lista_compras": ["Avena", "Plátano", "Pescado"],
        "total_estimado": 500
    },
    {
        "usuario_id": "u2",
        "semana": "2026-10-25", # <-- Formato de fecha de inicio
        "presupuesto": 1200,
        "menu": {"lunes": "Huevos revueltos", "martes": "Tacos de pescado"},
        "lista_compras": ["Huevos", "Espinaca", "Pescado", "Tortillas"],
        "total_estimado": 750
    }
]

# HistorialRecetas de prueba
historial = [
    {
        "usuario_id": "u1",
        "fecha": "2026-10-25T12:00:00",
        "receta_id": "r1",
        "titulo": "Ensalada de Pollo",
        "calorias": 400,
        "ingredientes_detectados": ["pollo", "lechuga"],
        "foto_refri": "fotos/refri_u1.jpg"
    },
    {
        "usuario_id": "u2",
        "fecha": "2026-10-25T19:30:00",
        "receta_id": "r2",
        "titulo": "Tacos de Pescado Saludables",
        "calorias": 380,
        "ingredientes_detectados": ["pescado", "limón", "tortilla"],
        "foto_refri": "fotos/refri_u2.jpg"
    }
]

# Recetario de prueba
recetario = [
    {
        "receta_id": "r1",
        "categoria": "Saludable",
        "titulo": "Ensalada de Pollo",
        "foto": "fotos/recetas/pollo.jpg",
        "descripcion": "Ensalada fresca y saludable.",
        "ingredientes": ["Pollo", "Lechuga", "Tomate"],
        "pasos": ["Cocinar el pollo", "Cortar vegetales", "Mezclar"],
        "calorias": 400,
        "tiempo_min": 20,
        "porciones": 1,
        "costo_estimado": 70
    },
    {
        "receta_id": "r2",
        "categoria": "Marina",
        "titulo": "Tacos de Pescado Saludables",
        "foto": "fotos/recetas/tacos_pescado.jpg",
        "descripcion": "Deliciosos tacos de pescado bajos en grasa.",
        "ingredientes": ["Pescado", "Limón", "Tortillas de maíz", "Col"],
        "pasos": ["Asar el pescado", "Calentar tortillas", "Armar los tacos"],
        "calorias": 380,
        "tiempo_min": 25,
        "porciones": 2,
        "costo_estimado": 95
    }
]

# Poblar los datos en cada tabla de DynamoDB
for item in usuarios:
    tabla_usuarios.put_item(Item=item)

for item in calorias:
    tabla_calorias.put_item(Item=item)

for item in plan:
    tabla_planes.put_item(Item=item)

for item in historial:
    tabla_historial.put_item(Item=item)

for item in recetario:
    tabla_recetario.put_item(Item=item)

print("¡Se cargaron correctamente los datos de prueba en todas las tablas!")