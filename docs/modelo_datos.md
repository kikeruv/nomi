# Modelo de datos

Nomi usa 4 tablas de DynamoDB y un bucket de S3 para las imágenes. Todas las tablas son `PAY_PER_REQUEST`.

En DynamoDB solo se declaran las llaves (PK, SK y las del GSI); los demás atributos se guardan con cada item. Las relaciones entre tablas son lógicas: no hay llaves foráneas y el backend valida que existan.

## Diagrama
```
Usuarios 1 ──── N Escaneos      (escanea)
Usuarios 1 ──── N Menus         (planifica)
Menus    N ──── N Recetario     (en el menú, por receta_id dentro de dias)
```

## Tablas

### `usuarios`
| Atributo | Tipo | Llave | Descripción |
|---|---|---|---|
| `usuario_id` | String | **PK** | Identificador del usuario |
| `nombre` | String | | Nombre |
| `correo` | String | | Correo |
| `personas` | Number | | Para cuántas personas cocina |
| `comidas_por_dia` | Number | | 1 a 3 (desayuno, comida, cena) |
| `dia_escaneo` | String | | Día en que escanea su refri (`lunes` … `domingo`) |
| `tiempo_max_min` | Number | | Minutos máximos por comida |
| `meta_calorias` | Number | | Meta diaria de kcal (opcional) |
| `meta_proteina` | Number | | Meta diaria de proteína en gramos |
| `preferencias` | List | | Lo que no quiere en su menú, ej. `["vegetariano", "sin_cerdo"]` |
| `tema` | String | | `auto`, `dark` o `light` |

La contraseña no se guarda aquí; en la entrega final la maneja Cognito.

### `escaneos`
| Atributo | Tipo | Llave | Descripción |
|---|---|---|---|
| `usuario_id` | String | **PK** | Dueño del escaneo |
| `fecha` | String | **SK** | Fecha y hora, ej. `2026-11-01T18:30:00` |
| `foto` | String | | Llave de la foto en S3 |
| `personas` | Number | | Personas con las que se armó el menú |
| `comidas_por_dia` | Number | | Comidas por día con las que se armó el menú |
| `ingredientes` | List | | `[{ "nombre": "huevo", "cantidad": "12 piezas" }, ...]` |

El último escaneo se obtiene con `query` por `usuario_id`, orden descendente (`ScanIndexForward=False`) y `Limit=1`.

### `menus`
| Atributo | Tipo | Llave | Descripción |
|---|---|---|---|
| `usuario_id` | String | **PK** | Dueño del menú |
| `semana` | String | **SK** | Semana ISO, ej. `2026-W45` |
| `dias` | List | | Los 7 días del menú |

Cada elemento de `dias`:
```json
{
    "dia": "lunes",
    "fecha": "2026-11-02",
    "total_kcal": 1430,
    "comidas": {
        "desayuno": { "receta_id": "r1", "titulo": "Huevos a la mexicana", "calorias": 320,
                      "tiempo_min": 15, "proteina_g": 20, "carbs_g": 10, "grasa_g": 22,
                      "usa_refri": true },
        "comida":   { ... },
        "cena":     { ... }
    }
}
```
El título, las kcal y los macros se copian de `recetario` (desnormalización) para pintar la semana sin hacer 21 lecturas. `usa_refri` indica si todos los ingredientes de la receta están en el escaneo.

### `recetario`
| Atributo | Tipo | Llave | Descripción |
|---|---|---|---|
| `receta_id` | String | **PK** | Identificador de la receta |
| `categoria` | String | **GSI** | `desayuno`, `comida` o `cena` |
| `titulo` | String | | Nombre |
| `imagen` | String | | Llave de la foto en S3 |
| `descripcion` | String | | Descripción corta |
| `ingredientes` | List | | `[{ "nombre": "Huevo", "cantidad": "4 piezas" }, ...]` |
| `pasos` | List | | Pasos de preparación |
| `calorias` | Number | | kcal por porción |
| `tiempo_min` | Number | | Minutos de preparación |
| `porciones` | Number | | Porciones |
| `proteina_g` | Number | | Proteína por porción |
| `carbs_g` | Number | | Carbohidratos por porción |
| `grasa_g` | Number | | Grasa por porción |

**GSI `CategoriaIndex`** (PK `categoria`, proyección `ALL`): permite `GET /recetas?categoria=desayuno` con `query` en lugar de `scan`.

## S3 (imágenes, bucket privado)
| Ruta | Contenido |
|---|---|
| `recetas/{receta_id}.jpg` | Foto de cada receta |
| `escaneos/{usuario_id}/{fecha}.jpg` | Foto del refri de cada escaneo |

La API convierte la llave (`imagen` o `foto`) en una URL firmada antes de mandarla a la página.

## Datos de prueba
`src/scripts/cargar_datos.py` carga 2 usuarios (`u1`, `u2`), un escaneo por usuario, 9 recetas (3 por categoría) y el menú de la semana `2026-W45` de cada usuario.

## Cambios respecto al modelo anterior
- Se eliminaron `calorias` (RegistroCalorias), `historial` (HistorialRecetas) y `plan` (PlanesSemanales).
- `plan` se reemplazó por `menus`; se agregó `escaneos`.
- `usuarios`: sin `edad` ni `presupuesto`; con datos para armar el menú y el tema.
- `recetario`: sin `costo_estimado`; con macros, `imagen` y categorías `desayuno` / `comida` / `cena`.
