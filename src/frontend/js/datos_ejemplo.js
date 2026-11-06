// Datos de ejemplo mientras no conectamos AWS.
// Tienen la misma forma que las tablas de DynamoDB (Usuarios, Escaneos, Menus, Recetario).
// Viven solo en memoria: no se guarda nada en el navegador y al recargar la página regresan como estaban.
// Son los mismos datos que carga src/scripts/cargar_datos.py en DynamoDB.
// Las fotos están en img/recetas/ (dentro del bucket de la página).

const RECETAS_EJEMPLO = [
    {
        receta_id: "r1", categoria: "desayuno", titulo: "Huevos a la mexicana",
        descripcion: "Huevos revueltos con jitomate, cebolla y chile.",
        tiempo_min: 15, porciones: 2, calorias: 320, proteina_g: 20, carbs_g: 10, grasa_g: 22, imagen_url: "img/recetas/r1.jpg",
        ingredientes: [
            { nombre: "Huevo", cantidad: "4 piezas" },
            { nombre: "Jitomate", cantidad: "2 piezas" },
            { nombre: "Cebolla", cantidad: "1/4 pieza" },
            { nombre: "Chile serrano", cantidad: "1 pieza" }
        ],
        pasos: [
            "Pica el jitomate, la cebolla y el chile.",
            "Sofríe la verdura en un sartén con poco aceite.",
            "Agrega los huevos batidos y mueve hasta que se cocinen."
        ]
    },
    {
        receta_id: "r2", categoria: "desayuno", titulo: "Chilaquiles verdes",
        descripcion: "Totopos bañados en salsa verde con huevo y queso.",
        tiempo_min: 20, porciones: 2, calorias: 520, proteina_g: 24, carbs_g: 58, grasa_g: 21, imagen_url: "img/recetas/r2.jpg",
        ingredientes: [
            { nombre: "Tortilla", cantidad: "8 piezas" },
            { nombre: "Salsa verde", cantidad: "1 taza" },
            { nombre: "Huevo", cantidad: "2 piezas" },
            { nombre: "Queso", cantidad: "50 g" },
            { nombre: "Cebolla", cantidad: "1/4 pieza" }
        ],
        pasos: [
            "Corta las tortillas en triángulos y dóralas.",
            "Calienta la salsa verde y agrega los totopos.",
            "Sirve con huevo estrellado, queso y cebolla."
        ]
    },
    {
        receta_id: "r3", categoria: "desayuno", titulo: "Avena con plátano",
        descripcion: "Avena cocida en leche con plátano y canela.",
        tiempo_min: 5, porciones: 1, calorias: 340, proteina_g: 12, carbs_g: 58, grasa_g: 7, imagen_url: "img/recetas/r3.jpg",
        ingredientes: [
            { nombre: "Avena", cantidad: "1/2 taza" },
            { nombre: "Leche", cantidad: "1 taza" },
            { nombre: "Plátano", cantidad: "1 pieza" },
            { nombre: "Canela", cantidad: "1 pizca" }
        ],
        pasos: [
            "Calienta la leche a fuego medio.",
            "Agrega la avena y mueve 3 minutos.",
            "Sirve con el plátano en rodajas y canela."
        ]
    },
    {
        receta_id: "r4", categoria: "comida", titulo: "Pollo con arroz",
        descripcion: "Pechuga de pollo con arroz rojo.",
        tiempo_min: 35, porciones: 2, calorias: 650, proteina_g: 45, carbs_g: 70, grasa_g: 18, imagen_url: "img/recetas/r4.jpg",
        ingredientes: [
            { nombre: "Pollo", cantidad: "400 g" },
            { nombre: "Arroz", cantidad: "1 taza" },
            { nombre: "Jitomate", cantidad: "2 piezas" },
            { nombre: "Cebolla", cantidad: "1/2 pieza" }
        ],
        pasos: [
            "Licúa el jitomate con la cebolla.",
            "Fríe el arroz, agrega el licuado y agua, y deja cocer 20 minutos.",
            "Cocina el pollo a la plancha y sírvelo con el arroz."
        ]
    },
    {
        receta_id: "r5", categoria: "comida", titulo: "Tinga de pollo",
        descripcion: "Pollo deshebrado en salsa de jitomate y chipotle.",
        tiempo_min: 30, porciones: 3, calorias: 590, proteina_g: 38, carbs_g: 45, grasa_g: 26, imagen_url: "img/recetas/r5.jpg",
        ingredientes: [
            { nombre: "Pollo", cantidad: "500 g" },
            { nombre: "Jitomate", cantidad: "3 piezas" },
            { nombre: "Cebolla", cantidad: "1 pieza" },
            { nombre: "Chipotle", cantidad: "2 piezas" },
            { nombre: "Tortilla", cantidad: "6 piezas" }
        ],
        pasos: [
            "Cuece y deshebra el pollo.",
            "Licúa el jitomate con el chipotle.",
            "Acitrona la cebolla, agrega la salsa y el pollo, y deja 10 minutos.",
            "Sirve en tostadas o tortillas."
        ]
    },
    {
        receta_id: "r6", categoria: "comida", titulo: "Pasta con jitomate",
        descripcion: "Pasta corta en salsa de jitomate con queso.",
        tiempo_min: 25, porciones: 2, calorias: 560, proteina_g: 18, carbs_g: 85, grasa_g: 14, imagen_url: "img/recetas/r6.jpg",
        ingredientes: [
            { nombre: "Pasta", cantidad: "200 g" },
            { nombre: "Jitomate", cantidad: "3 piezas" },
            { nombre: "Ajo", cantidad: "1 diente" },
            { nombre: "Queso", cantidad: "40 g" }
        ],
        pasos: [
            "Cuece la pasta en agua con sal.",
            "Licúa el jitomate con el ajo y cocina la salsa 10 minutos.",
            "Mezcla la pasta con la salsa y sirve con queso."
        ]
    },
    {
        receta_id: "r7", categoria: "cena", titulo: "Quesadillas",
        descripcion: "Tortillas de maíz con queso derretido.",
        tiempo_min: 10, porciones: 1, calorias: 410, proteina_g: 18, carbs_g: 40, grasa_g: 19, imagen_url: "img/recetas/r7.jpg",
        ingredientes: [
            { nombre: "Tortilla", cantidad: "3 piezas" },
            { nombre: "Queso", cantidad: "80 g" }
        ],
        pasos: [
            "Calienta las tortillas en el comal.",
            "Agrega el queso, dobla y deja que se derrita."
        ]
    },
    {
        receta_id: "r8", categoria: "cena", titulo: "Molletes",
        descripcion: "Bolillo con frijoles y queso gratinado.",
        tiempo_min: 15, porciones: 2, calorias: 420, proteina_g: 17, carbs_g: 55, grasa_g: 14, imagen_url: "img/recetas/r8.jpg",
        ingredientes: [
            { nombre: "Bolillo", cantidad: "2 piezas" },
            { nombre: "Frijoles", cantidad: "1 taza" },
            { nombre: "Queso", cantidad: "60 g" }
        ],
        pasos: [
            "Parte los bolillos a la mitad.",
            "Unta los frijoles y pon el queso encima.",
            "Hornea 8 minutos hasta que se gratine."
        ]
    },
    {
        receta_id: "r9", categoria: "cena", titulo: "Sopa de verduras",
        descripcion: "Caldo ligero con verduras de temporada.",
        tiempo_min: 40, porciones: 4, calorias: 260, proteina_g: 8, carbs_g: 35, grasa_g: 9, imagen_url: "img/recetas/r9.jpg",
        ingredientes: [
            { nombre: "Calabaza", cantidad: "2 piezas" },
            { nombre: "Zanahoria", cantidad: "2 piezas" },
            { nombre: "Jitomate", cantidad: "2 piezas" },
            { nombre: "Cebolla", cantidad: "1/2 pieza" }
        ],
        pasos: [
            "Pica todas las verduras.",
            "Licúa el jitomate con la cebolla y sofríe.",
            "Agrega agua y las verduras, y deja hervir 25 minutos."
        ]
    }
];

const USUARIOS_EJEMPLO = {
    u1: {
        usuario_id: "u1", nombre: "Enrique Ruvalcaba", correo: "enrique@gmail.com",
        personas: 2, comidas_por_dia: 3, dia_escaneo: "domingo", tiempo_max_min: 45,
        meta_calorias: 2000, meta_proteina: 120, preferencias: ["sin_cerdo"], tema: "dark"
    }
};

const ESCANEOS_EJEMPLO = [
    {
        usuario_id: "u1", fecha: "2026-11-01T18:30:00", personas: 2, comidas_por_dia: 3,
        ingredientes: [
            { nombre: "huevo", cantidad: "12 piezas" },
            { nombre: "leche", cantidad: "1 L" },
            { nombre: "pollo", cantidad: "800 g" },
            { nombre: "queso", cantidad: "400 g" },
            { nombre: "jitomate", cantidad: "6 piezas" },
            { nombre: "frijoles", cantidad: "1 bolsa" },
            { nombre: "tortilla", cantidad: "1 kg" },
            { nombre: "cebolla", cantidad: "2 piezas" },
            { nombre: "arroz", cantidad: "1 kg" }
        ]
    }
];

// Menú de la semana actual: rota las recetas de cada categoría en los 7 días
function menuDeEjemplo(usuarioId, semana) {
    const escaneo = ESCANEOS_EJEMPLO[ESCANEOS_EJEMPLO.length - 1];
    const lunes = new Date();
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
    const nombresDia = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

    const dias = nombresDia.map((nombre, i) => {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);
        const comidas = {};

        ["desayuno", "comida", "cena"].forEach((tipo, j) => {
            const opciones = RECETAS_EJEMPLO.filter((receta) => receta.categoria === tipo);
            const receta = opciones[(i + j) % opciones.length];
            const enRefri = ingredientesEnRefri(receta, escaneo);
            comidas[tipo] = {
                receta_id: receta.receta_id,
                titulo: receta.titulo,
                calorias: receta.calorias,
                tiempo_min: receta.tiempo_min,
                proteina_g: receta.proteina_g,
                carbs_g: receta.carbs_g,
                grasa_g: receta.grasa_g,
                usa_refri: enRefri.tengo === enRefri.total
            };
        });

        const total = comidas.desayuno.calorias + comidas.comida.calorias + comidas.cena.calorias;
        const textoFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
        return { dia: nombre, fecha: textoFecha, total_kcal: total, comidas: comidas };
    });

    return { usuario_id: usuarioId, semana: semana, dias: dias };
}
