import boto3

dynamodb = boto3.resource("dynamodb")

# Referencias a las tablas basadas en tu diagrama
tabla_usuarios = dynamodb.Table("usuarios")
tabla_escaneos = dynamodb.Table("escaneos")
tabla_menus = dynamodb.Table("menus")
tabla_recetario = dynamodb.Table("recetario")

# Usuarios de prueba
usuarios = [
    {
        "usuario_id": "u1",
        "nombre": "Enrique Ruvalcaba",
        "correo": "enrique@gmail.com",
        "personas": 2,
        "comidas_por_dia": 3,
        "dia_escaneo": "domingo",
        "tiempo_max_min": 45,
        "meta_calorias": 2000,
        "meta_proteina": 120,
        "preferencias": ["sin_cerdo"],
        "tema": "dark"
    },
    {
        "usuario_id": "u2",
        "nombre": "Alan Rodriguez",
        "correo": "alan@gmail.com",
        "personas": 1,
        "comidas_por_dia": 3,
        "dia_escaneo": "sabado",
        "tiempo_max_min": 30,
        "meta_calorias": 2500,
        "meta_proteina": 150,
        "preferencias": [],
        "tema": "light"
    },
]

# Escaneos del refri de prueba (la foto se guarda en S3, aquí solo va su llave)
escaneos = [
    {
        "usuario_id": "u1",
        "fecha": "2026-11-01T18:30:00",
        "foto": "escaneos/u1/2026-11-01T18:30:00.jpg",
        "personas": 2,
        "comidas_por_dia": 3,
        "ingredientes": [
            {"nombre": "huevo", "cantidad": "12 piezas"},
            {"nombre": "leche", "cantidad": "1 L"},
            {"nombre": "pollo", "cantidad": "800 g"},
            {"nombre": "queso", "cantidad": "400 g"},
            {"nombre": "jitomate", "cantidad": "6 piezas"},
            {"nombre": "frijoles", "cantidad": "1 bolsa"},
            {"nombre": "tortilla", "cantidad": "1 kg"},
            {"nombre": "cebolla", "cantidad": "2 piezas"},
            {"nombre": "arroz", "cantidad": "1 kg"}
        ]
    },
    {
        "usuario_id": "u2",
        "fecha": "2026-10-31T10:00:00",
        "foto": "escaneos/u2/2026-10-31T10:00:00.jpg",
        "personas": 1,
        "comidas_por_dia": 3,
        "ingredientes": [
            {"nombre": "avena", "cantidad": "1 kg"},
            {"nombre": "leche", "cantidad": "2 L"},
            {"nombre": "platano", "cantidad": "6 piezas"},
            {"nombre": "pasta", "cantidad": "500 g"}
        ]
    },
]

# Recetario de prueba (las mismas recetas que js/datos_ejemplo.js)
recetario = [
    {
        "receta_id": "r1",
        "categoria": "desayuno",
        "titulo": "Huevos a la mexicana",
        "imagen": "recetas/r1.jpg",
        "descripcion": "Huevos revueltos con jitomate, cebolla y chile.",
        "ingredientes": [
            {"nombre": "Huevo", "cantidad": "4 piezas"},
            {"nombre": "Jitomate", "cantidad": "2 piezas"},
            {"nombre": "Cebolla", "cantidad": "1/4 pieza"},
            {"nombre": "Chile serrano", "cantidad": "1 pieza"}
        ],
        "pasos": [
            "Pica el jitomate, la cebolla y el chile.",
            "Sofríe la verdura en un sartén con poco aceite.",
            "Agrega los huevos batidos y mueve hasta que se cocinen."
        ],
        "calorias": 320,
        "tiempo_min": 15,
        "porciones": 2,
        "proteina_g": 20,
        "carbs_g": 10,
        "grasa_g": 22
    },
    {
        "receta_id": "r2",
        "categoria": "desayuno",
        "titulo": "Chilaquiles verdes",
        "imagen": "recetas/r2.jpg",
        "descripcion": "Totopos bañados en salsa verde con huevo y queso.",
        "ingredientes": [
            {"nombre": "Tortilla", "cantidad": "8 piezas"},
            {"nombre": "Salsa verde", "cantidad": "1 taza"},
            {"nombre": "Huevo", "cantidad": "2 piezas"},
            {"nombre": "Queso", "cantidad": "50 g"},
            {"nombre": "Cebolla", "cantidad": "1/4 pieza"}
        ],
        "pasos": [
            "Corta las tortillas en triángulos y dóralas.",
            "Calienta la salsa verde y agrega los totopos.",
            "Sirve con huevo estrellado, queso y cebolla."
        ],
        "calorias": 520,
        "tiempo_min": 20,
        "porciones": 2,
        "proteina_g": 24,
        "carbs_g": 58,
        "grasa_g": 21
    },
    {
        "receta_id": "r3",
        "categoria": "desayuno",
        "titulo": "Avena con plátano",
        "imagen": "recetas/r3.jpg",
        "descripcion": "Avena cocida en leche con plátano y canela.",
        "ingredientes": [
            {"nombre": "Avena", "cantidad": "1/2 taza"},
            {"nombre": "Leche", "cantidad": "1 taza"},
            {"nombre": "Plátano", "cantidad": "1 pieza"},
            {"nombre": "Canela", "cantidad": "1 pizca"}
        ],
        "pasos": [
            "Calienta la leche a fuego medio.",
            "Agrega la avena y mueve 3 minutos.",
            "Sirve con el plátano en rodajas y canela."
        ],
        "calorias": 340,
        "tiempo_min": 5,
        "porciones": 1,
        "proteina_g": 12,
        "carbs_g": 58,
        "grasa_g": 7
    },
    {
        "receta_id": "r4",
        "categoria": "comida",
        "titulo": "Pollo con arroz",
        "imagen": "recetas/r4.jpg",
        "descripcion": "Pechuga de pollo con arroz rojo.",
        "ingredientes": [
            {"nombre": "Pollo", "cantidad": "400 g"},
            {"nombre": "Arroz", "cantidad": "1 taza"},
            {"nombre": "Jitomate", "cantidad": "2 piezas"},
            {"nombre": "Cebolla", "cantidad": "1/2 pieza"}
        ],
        "pasos": [
            "Licúa el jitomate con la cebolla.",
            "Fríe el arroz, agrega el licuado y agua, y deja cocer 20 minutos.",
            "Cocina el pollo a la plancha y sírvelo con el arroz."
        ],
        "calorias": 650,
        "tiempo_min": 35,
        "porciones": 2,
        "proteina_g": 45,
        "carbs_g": 70,
        "grasa_g": 18
    },
    {
        "receta_id": "r5",
        "categoria": "comida",
        "titulo": "Tinga de pollo",
        "imagen": "recetas/r5.jpg",
        "descripcion": "Pollo deshebrado en salsa de jitomate y chipotle.",
        "ingredientes": [
            {"nombre": "Pollo", "cantidad": "500 g"},
            {"nombre": "Jitomate", "cantidad": "3 piezas"},
            {"nombre": "Cebolla", "cantidad": "1 pieza"},
            {"nombre": "Chipotle", "cantidad": "2 piezas"},
            {"nombre": "Tortilla", "cantidad": "6 piezas"}
        ],
        "pasos": [
            "Cuece y deshebra el pollo.",
            "Licúa el jitomate con el chipotle.",
            "Acitrona la cebolla, agrega la salsa y el pollo, y deja 10 minutos.",
            "Sirve en tostadas o tortillas."
        ],
        "calorias": 590,
        "tiempo_min": 30,
        "porciones": 3,
        "proteina_g": 38,
        "carbs_g": 45,
        "grasa_g": 26
    },
    {
        "receta_id": "r6",
        "categoria": "comida",
        "titulo": "Pasta con jitomate",
        "imagen": "recetas/r6.jpg",
        "descripcion": "Pasta corta en salsa de jitomate con queso.",
        "ingredientes": [
            {"nombre": "Pasta", "cantidad": "200 g"},
            {"nombre": "Jitomate", "cantidad": "3 piezas"},
            {"nombre": "Ajo", "cantidad": "1 diente"},
            {"nombre": "Queso", "cantidad": "40 g"}
        ],
        "pasos": [
            "Cuece la pasta en agua con sal.",
            "Licúa el jitomate con el ajo y cocina la salsa 10 minutos.",
            "Mezcla la pasta con la salsa y sirve con queso."
        ],
        "calorias": 560,
        "tiempo_min": 25,
        "porciones": 2,
        "proteina_g": 18,
        "carbs_g": 85,
        "grasa_g": 14
    },
    {
        "receta_id": "r7",
        "categoria": "cena",
        "titulo": "Quesadillas",
        "imagen": "recetas/r7.jpg",
        "descripcion": "Tortillas de maíz con queso derretido.",
        "ingredientes": [
            {"nombre": "Tortilla", "cantidad": "3 piezas"},
            {"nombre": "Queso", "cantidad": "80 g"}
        ],
        "pasos": [
            "Calienta las tortillas en el comal.",
            "Agrega el queso, dobla y deja que se derrita."
        ],
        "calorias": 410,
        "tiempo_min": 10,
        "porciones": 1,
        "proteina_g": 18,
        "carbs_g": 40,
        "grasa_g": 19
    },
    {
        "receta_id": "r8",
        "categoria": "cena",
        "titulo": "Molletes",
        "imagen": "recetas/r8.jpg",
        "descripcion": "Bolillo con frijoles y queso gratinado.",
        "ingredientes": [
            {"nombre": "Bolillo", "cantidad": "2 piezas"},
            {"nombre": "Frijoles", "cantidad": "1 taza"},
            {"nombre": "Queso", "cantidad": "60 g"}
        ],
        "pasos": [
            "Parte los bolillos a la mitad.",
            "Unta los frijoles y pon el queso encima.",
            "Hornea 8 minutos hasta que se gratine."
        ],
        "calorias": 420,
        "tiempo_min": 15,
        "porciones": 2,
        "proteina_g": 17,
        "carbs_g": 55,
        "grasa_g": 14
    },
    {
        "receta_id": "r9",
        "categoria": "cena",
        "titulo": "Sopa de verduras",
        "imagen": "recetas/r9.jpg",
        "descripcion": "Caldo ligero con verduras de temporada.",
        "ingredientes": [
            {"nombre": "Calabaza", "cantidad": "2 piezas"},
            {"nombre": "Zanahoria", "cantidad": "2 piezas"},
            {"nombre": "Jitomate", "cantidad": "2 piezas"},
            {"nombre": "Cebolla", "cantidad": "1/2 pieza"}
        ],
        "pasos": [
            "Pica todas las verduras.",
            "Licúa el jitomate con la cebolla y sofríe.",
            "Agrega agua y las verduras, y deja hervir 25 minutos."
        ],
        "calorias": 260,
        "tiempo_min": 40,
        "porciones": 4,
        "proteina_g": 8,
        "carbs_g": 35,
        "grasa_g": 9
    }
]

# Menus de prueba: 7 días con desayuno, comida y cena armados con el recetario
def comida_del_menu(receta, escaneo):
    # usa_refri = todos los ingredientes de la receta están en el escaneo
    del_refri = [ingrediente["nombre"].lower() for ingrediente in escaneo["ingredientes"]]
    usa_refri = all(
        any(nombre in ingrediente["nombre"].lower() for nombre in del_refri)
        for ingrediente in receta["ingredientes"]
    )
    return {
        "receta_id": receta["receta_id"],
        "titulo": receta["titulo"],
        "calorias": receta["calorias"],
        "tiempo_min": receta["tiempo_min"],
        "proteina_g": receta["proteina_g"],
        "carbs_g": receta["carbs_g"],
        "grasa_g": receta["grasa_g"],
        "usa_refri": usa_refri
    }

def armar_dias(escaneo, fechas):
    nombres_dia = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
    dias = []
    for i in range(7):
        comidas = {}
        for j, tipo in enumerate(["desayuno", "comida", "cena"]):
            opciones = [receta for receta in recetario if receta["categoria"] == tipo]
            comidas[tipo] = comida_del_menu(opciones[(i + j) % len(opciones)], escaneo)
        total = sum(comida["calorias"] for comida in comidas.values())
        dias.append({"dia": nombres_dia[i], "fecha": fechas[i], "total_kcal": total, "comidas": comidas})
    return dias

fechas_semana_45 = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]

menus = [
    {"usuario_id": "u1", "semana": "2026-W45", "dias": armar_dias(escaneos[0], fechas_semana_45)},
    {"usuario_id": "u2", "semana": "2026-W45", "dias": armar_dias(escaneos[1], fechas_semana_45)},
]

# Poblar los datos en cada tabla de DynamoDB
for item in usuarios:
    tabla_usuarios.put_item(Item=item)

for item in escaneos:
    tabla_escaneos.put_item(Item=item)

for item in recetario:
    tabla_recetario.put_item(Item=item)

for item in menus:
    tabla_menus.put_item(Item=item)

print("¡Se cargaron correctamente los datos de prueba en todas las tablas!")
