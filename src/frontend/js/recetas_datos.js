// Recetas de ejemplo con la misma forma que la tabla Recetario (PK categoria, SK receta_id)
// En la entrega final vendrán de la API; por ahora las usan recetas.html y receta.html.

const RECETAS = [
    {
        categoria: "desayuno", receta_id: "r1", titulo: "Avena con plátano",
        descripcion: "Avena cocida en leche con plátano, canela y un toque de miel.",
        tiempo_min: 5, porciones: 1, calorias: 320,
        ingredientes: [
            { nombre: "Avena", cantidad: "1/2 taza" },
            { nombre: "Leche", cantidad: "1 taza" },
            { nombre: "Plátano", cantidad: "1 pieza" },
            { nombre: "Canela", cantidad: "1 pizca" },
            { nombre: "Miel", cantidad: "1 cdita" }
        ],
        pasos: [
            "Calienta la leche en una olla a fuego medio.",
            "Agrega la avena y mueve por 3 minutos hasta que espese.",
            "Sirve y pon encima el plátano en rodajas, la canela y la miel."
        ]
    },
    {
        categoria: "desayuno", receta_id: "r2", titulo: "Chilaquiles verdes",
        descripcion: "Totopos bañados en salsa verde con crema, queso y cebolla.",
        tiempo_min: 20, porciones: 2, calorias: 650,
        ingredientes: [
            { nombre: "Totopos", cantidad: "2 tazas" },
            { nombre: "Salsa verde", cantidad: "1 taza" },
            { nombre: "Crema", cantidad: "2 cdas" },
            { nombre: "Queso fresco", cantidad: "50 g" },
            { nombre: "Cebolla", cantidad: "1/4 pieza" }
        ],
        pasos: [
            "Calienta la salsa verde en un sartén.",
            "Agrega los totopos y mezcla hasta que se cubran.",
            "Sirve con crema, queso desmoronado y cebolla en rodajas."
        ]
    },
    {
        categoria: "desayuno", receta_id: "r3", titulo: "Smoothie de frutos rojos",
        descripcion: "Licuado de fresas, moras y yogur natural.",
        tiempo_min: 5, porciones: 1, calorias: 210,
        ingredientes: [
            { nombre: "Fresas", cantidad: "1/2 taza" },
            { nombre: "Moras", cantidad: "1/2 taza" },
            { nombre: "Yogur natural", cantidad: "1/2 taza" },
            { nombre: "Agua o leche", cantidad: "1/2 taza" }
        ],
        pasos: [
            "Lava la fruta.",
            "Licúa todos los ingredientes hasta que quede liso.",
            "Sirve frío."
        ]
    },
    {
        categoria: "comida", receta_id: "r4", titulo: "Tacos de pescado",
        descripcion: "Pescado a la plancha en tortilla de maíz con col y salsa.",
        tiempo_min: 20, porciones: 4, calorias: 380,
        ingredientes: [
            { nombre: "Filete de pescado", cantidad: "400 g" },
            { nombre: "Tortillas de maíz", cantidad: "8 piezas" },
            { nombre: "Col morada", cantidad: "1 taza" },
            { nombre: "Limón", cantidad: "2 piezas" },
            { nombre: "Salsa", cantidad: "Al gusto" }
        ],
        pasos: [
            "Sazona el pescado con sal, pimienta y limón.",
            "Cocínalo en un sartén 3 minutos por lado.",
            "Calienta las tortillas.",
            "Arma los tacos con el pescado, la col y la salsa."
        ]
    },
    {
        categoria: "comida", receta_id: "r5", titulo: "Bowl de pollo y arroz",
        descripcion: "Pollo a la plancha con arroz integral, aguacate y frijoles.",
        tiempo_min: 30, porciones: 2, calorias: 540,
        ingredientes: [
            { nombre: "Pechuga de pollo", cantidad: "300 g" },
            { nombre: "Arroz integral", cantidad: "1 taza" },
            { nombre: "Frijoles", cantidad: "1/2 taza" },
            { nombre: "Aguacate", cantidad: "1 pieza" }
        ],
        pasos: [
            "Cocina el arroz según el empaque.",
            "Asa el pollo y córtalo en tiras.",
            "Sirve el arroz, encima el pollo, los frijoles y el aguacate."
        ]
    },
    {
        categoria: "comida", receta_id: "r6", titulo: "Enchiladas verdes",
        descripcion: "Tortillas rellenas de pollo bañadas en salsa verde.",
        tiempo_min: 35, porciones: 3, calorias: 520,
        ingredientes: [
            { nombre: "Tortillas de maíz", cantidad: "9 piezas" },
            { nombre: "Pollo deshebrado", cantidad: "2 tazas" },
            { nombre: "Salsa verde", cantidad: "2 tazas" },
            { nombre: "Crema y queso", cantidad: "Al gusto" }
        ],
        pasos: [
            "Calienta la salsa verde.",
            "Pasa cada tortilla por la salsa y rellénala de pollo.",
            "Enróllalas y báñalas con más salsa.",
            "Sirve con crema y queso."
        ]
    },
    {
        categoria: "cena", receta_id: "r7", titulo: "Ensalada de quinoa",
        descripcion: "Quinoa con jitomate, pepino, aguacate y limón.",
        tiempo_min: 15, porciones: 2, calorias: 310,
        ingredientes: [
            { nombre: "Quinoa cocida", cantidad: "1 taza" },
            { nombre: "Jitomate", cantidad: "1 pieza" },
            { nombre: "Pepino", cantidad: "1/2 pieza" },
            { nombre: "Aguacate", cantidad: "1/2 pieza" },
            { nombre: "Limón", cantidad: "1 pieza" }
        ],
        pasos: [
            "Pica el jitomate, el pepino y el aguacate.",
            "Mézclalos con la quinoa.",
            "Agrega jugo de limón, sal y pimienta."
        ]
    },
    {
        categoria: "cena", receta_id: "r8", titulo: "Sopa de lentejas",
        descripcion: "Lentejas cocidas con jitomate, zanahoria y cebolla.",
        tiempo_min: 40, porciones: 4, calorias: 290,
        ingredientes: [
            { nombre: "Lentejas", cantidad: "1 taza" },
            { nombre: "Jitomate", cantidad: "2 piezas" },
            { nombre: "Zanahoria", cantidad: "1 pieza" },
            { nombre: "Cebolla", cantidad: "1/2 pieza" },
            { nombre: "Agua", cantidad: "1 litro" }
        ],
        pasos: [
            "Licúa el jitomate con la cebolla y sofríelo en una olla.",
            "Agrega las lentejas, la zanahoria picada y el agua.",
            "Cocina a fuego medio por 30 minutos.",
            "Ajusta de sal y sirve."
        ]
    }
];