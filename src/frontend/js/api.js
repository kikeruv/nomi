// Llamadas a la API de Nomi (página -> backend -> DynamoDB y S3)
// Los endpoints y lo que reciben/regresan están en docs/api.md

// Función base: hace la petición y convierte la respuesta en datos o en error
async function pedir(metodo, ruta, cuerpo) {
    if (!CONFIG.API_URL) {
        throw new Error("Falta la URL de la API en js/config.js.");
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
