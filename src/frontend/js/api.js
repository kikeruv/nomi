// Llamadas a la API de Nomi (API Gateway -> contenedor en EC2 -> DynamoDB)
//
// Contrato (lo que manda y recibe cada endpoint):
//
// GET  /usuarios/{usuario_id}            -> 200 { usuario_id, nombre, correo, personas, comidas_por_dia,
//                                                 dia_escaneo, tiempo_max_min, meta_calorias, meta_proteina,
//                                                 preferencias: [..], tema }      404 si no existe
// POST /usuarios                         -> 201 usuario creado                   400 si faltan datos
// PUT  /usuarios/{usuario_id}            -> 200 usuario actualizado              400 si faltan datos
//
// POST /escaneos                         body { usuario_id, personas, comidas_por_dia,
//                                               ingredientes: [{ nombre, cantidad }] }
//                                        -> 201 { usuario_id, fecha, ... }       400 si faltan datos
// GET  /escaneos/{usuario_id}/ultimo     -> 200 el escaneo más reciente          404 si no hay
//
// GET  /menus/{usuario_id}/{semana}      -> 200 { usuario_id, semana, dias: [
//                                                 { dia, fecha, total_kcal,
//                                                   comidas: { desayuno, comida, cena } } ] }
//                                           cada comida: { receta_id, titulo, calorias, tiempo_min,
//                                                          proteina_g, carbs_g, grasa_g, usa_refri }
//                                        404 si no hay menú esa semana
// PUT  /menus/{usuario_id}/{semana}      body { dias } -> 200 menú actualizado (al cambiar un platillo)
//
// GET  /recetas?categoria=desayuno       -> 200 [ receta, ... ]  (sin categoria: todas)
// GET  /recetas/{receta_id}              -> 200 receta                           404 si no existe
//                                           receta: { receta_id, categoria, titulo, descripcion, tiempo_min,
//                                                     porciones, calorias, proteina_g, carbs_g, grasa_g,
//                                                     imagen_url, ingredientes: [{ nombre, cantidad }], pasos: [..] }

// ---------- Modo de ejemplo (sin AWS) ----------
// Mientras CONFIG.API_URL esté vacío, las respuestas salen de js/datos_ejemplo.js.
// Los cambios (crear cuenta, guardar perfil, escanear, cambiar platillo) duran
// solo mientras la página está abierta: no se guarda nada en el navegador.

const menusEjemplo = {};

function pedirEjemplo(metodo, ruta, cuerpo) {
    const [camino, consulta] = ruta.split("?");
    const partes = camino.split("/").filter(Boolean).map(decodeURIComponent);

    // /usuarios
    if (partes[0] === "usuarios") {
        if (metodo === "POST") {
            USUARIOS_EJEMPLO[cuerpo.usuario_id] = cuerpo;
            return cuerpo;
        }
        const usuario = USUARIOS_EJEMPLO[partes[1]];
        if (metodo === "PUT") {
            USUARIOS_EJEMPLO[partes[1]] = { ...(usuario || { usuario_id: partes[1] }), ...cuerpo };
            return USUARIOS_EJEMPLO[partes[1]];
        }
        return usuario || null;
    }

    // /escaneos
    if (partes[0] === "escaneos") {
        if (metodo === "POST") {
            const hora = new Date().toTimeString().slice(0, 8);
            const escaneo = { ...cuerpo, fecha: `${fechaHoy()}T${hora}` };   // la SK la pone el backend
            ESCANEOS_EJEMPLO.push(escaneo);
            return escaneo;
        }
        const delUsuario = ESCANEOS_EJEMPLO.filter((escaneo) => escaneo.usuario_id === partes[1]);
        return delUsuario.length ? delUsuario[delUsuario.length - 1] : null;
    }

    // /menus/{usuario_id}/{semana}
    if (partes[0] === "menus") {
        const llave = `${partes[1]}|${partes[2]}`;
        if (metodo === "PUT") {
            menusEjemplo[llave] = { usuario_id: partes[1], semana: partes[2], ...cuerpo };
        }
        if (!menusEjemplo[llave] && USUARIOS_EJEMPLO[partes[1]]) {
            menusEjemplo[llave] = menuDeEjemplo(partes[1], partes[2]);
        }
        return menusEjemplo[llave] || null;
    }

    // /recetas y /recetas/{receta_id}
    if (partes[0] === "recetas") {
        if (partes[1]) {
            return RECETAS_EJEMPLO.find((receta) => receta.receta_id === partes[1]) || null;
        }
        const categoria = new URLSearchParams(consulta || "").get("categoria");
        return RECETAS_EJEMPLO.filter((receta) => !categoria || receta.categoria === categoria);
    }

    return null;
}

// Función base: hace la petición y convierte la respuesta en datos o en error
async function pedir(metodo, ruta, cuerpo) {
    if (!CONFIG.API_URL) {
        return pedirEjemplo(metodo, ruta, cuerpo);
    }

    const opciones = { method: metodo, headers: {} };
    if (cuerpo !== undefined) {
        opciones.headers["Content-Type"] = "application/json";
        opciones.body = JSON.stringify(cuerpo);
    }

    let respuesta;
    try {
        respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, opciones);
    } catch (error) {
        throw new Error("No pudimos conectar con el servidor.");
    }

    // 404 = no hay datos (no es un error de la app)
    if (respuesta.status === 404) return null;

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.error || `El servidor respondió ${respuesta.status}.`);
    }
    return datos;
}

// ---------- Usuarios ----------
function obtenerUsuario(usuarioId) {
    return pedir("GET", `/usuarios/${encodeURIComponent(usuarioId)}`);
}

function crearUsuario(usuario) {
    return pedir("POST", "/usuarios", usuario);
}

function actualizarUsuario(usuarioId, cambios) {
    return pedir("PUT", `/usuarios/${encodeURIComponent(usuarioId)}`, cambios);
}

// ---------- Escaneos del refri ----------
function guardarEscaneo(escaneo) {
    return pedir("POST", "/escaneos", escaneo);
}

function obtenerUltimoEscaneo(usuarioId) {
    return pedir("GET", `/escaneos/${encodeURIComponent(usuarioId)}/ultimo`);
}

// ---------- Menús ----------
function obtenerMenu(usuarioId, semana) {
    return pedir("GET", `/menus/${encodeURIComponent(usuarioId)}/${encodeURIComponent(semana)}`);
}

function actualizarMenu(usuarioId, semana, dias) {
    return pedir("PUT", `/menus/${encodeURIComponent(usuarioId)}/${encodeURIComponent(semana)}`, { dias: dias });
}

// ---------- Recetas ----------
function obtenerRecetas(categoria) {
    const filtro = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
    return pedir("GET", `/recetas${filtro}`);
}

function obtenerReceta(recetaId) {
    return pedir("GET", `/recetas/${encodeURIComponent(recetaId)}`);
}

// ---------- Fechas ----------
// Semana ISO de una fecha, en el formato que usa la tabla Menus: "2026-W45"
function semanaISO(fecha = new Date()) {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaSemana = d.getUTCDay() || 7;            // lunes = 1 ... domingo = 7
    d.setUTCDate(d.getUTCDate() + 4 - diaSemana);    // jueves de esa semana
    const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numero = Math.ceil(((d - inicioAnio) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

// Fecha local como "AAAA-MM-DD"
function fechaHoy() {
    const f = new Date();
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

// "2026-11-04" -> objeto Date local (sin que se recorra un día por la zona horaria)
function leerFecha(texto) {
    const [anio, mes, dia] = texto.slice(0, 10).split("-").map(Number);
    return new Date(anio, mes - 1, dia);
}

function formatoNumero(numero) {
    return Number(numero).toLocaleString("es-MX");
}

// ---------- Utilidades de pantalla ----------
// Crea un elemento con clase y texto (textContent evita meter HTML de la base de datos)
function crear(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function mostrarErrorPagina(mensaje) {
    const caja = document.getElementById("error");
    if (!caja) return;
    caja.textContent = mensaje;
    caja.hidden = false;
}

// Pone la inicial del usuario en el avatar de la barra
function ponerAvatar(usuario) {
    const avatar = document.getElementById("avatar");
    if (avatar && usuario && usuario.nombre) {
        avatar.textContent = usuario.nombre.charAt(0).toUpperCase();
    }
}

// ---------- Ingredientes del refri ----------
// "Jitomate " -> "jitomate", "Plátano" -> "platano"
function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Cuántos ingredientes de la receta están en el último escaneo
function ingredientesEnRefri(receta, escaneo) {
    const total = (receta.ingredientes || []).length;
    if (!escaneo || !escaneo.ingredientes) return { tengo: 0, total: total, nombres: [] };

    const delRefri = escaneo.ingredientes.map((ingrediente) => normalizar(ingrediente.nombre));
    const nombres = (receta.ingredientes || [])
        .map((ingrediente) => ingrediente.nombre)
        .filter((nombre) => {
            const n = normalizar(nombre);
            return delRefri.some((r) => n.includes(r) || r.includes(n));
        });

    return { tengo: nombres.length, total: total, nombres: nombres };
}
