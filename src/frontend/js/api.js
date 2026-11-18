// ---------- Sesión con Cognito ----------
// Las URLs y el Client ID vienen de CONFIG (js/config.js, generado desde .env)

// Llama a Cognito con fetch
async function cognito(accion, datos) {
    const respuesta = await fetch(CONFIG.COGNITO_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": `AWSCognitoIdentityProviderService.${accion}`
        },
        body: JSON.stringify({ ClientId: CONFIG.COGNITO_CLIENT_ID, ...datos })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.message);
    return resultado;
}

function registrarse(correo, contrasena) {
    return cognito("SignUp", {
        Username: correo,
        Password: contrasena,
        UserAttributes: [{ Name: "email", Value: correo }]
    });
}

function confirmarCuenta(correo, codigo) {
    return cognito("ConfirmSignUp", { Username: correo, ConfirmationCode: codigo });
}

async function iniciarSesion(correo, contrasena) {
    const resultado = await cognito("InitiateAuth", {
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: { USERNAME: correo, PASSWORD: contrasena }
    });
    sessionStorage.setItem("nomi-token", resultado.AuthenticationResult.IdToken);
    sessionStorage.setItem("nomi-refresh", resultado.AuthenticationResult.RefreshToken);
}

// Pide un token nuevo sin volver a escribir la contraseña
async function renovarToken() {
    const refresh = sessionStorage.getItem("nomi-refresh");
    if (!refresh) return false;
    try {
        const resultado = await cognito("InitiateAuth", {
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: { REFRESH_TOKEN: refresh }
        });
        sessionStorage.setItem("nomi-token", resultado.AuthenticationResult.IdToken);
        return true;
    } catch (error) {
        return false;
    }
}

function cerrarSesion() {
    sessionStorage.removeItem("nomi-token");
    sessionStorage.removeItem("nomi-refresh");
    window.location.href = "login.html";
}

function leerToken() {
    return sessionStorage.getItem("nomi-token");
}

// Datos que trae el token (sub y email)
function datosDelToken() {
    const token = leerToken();
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
}

// El usuario_id es el sub de Cognito
function usuarioActual() {
    const datos = datosDelToken();
    return datos ? datos.sub : null;
}

// Sin sesión manda al login
function pedirSesion() {
    const usuarioId = usuarioActual();
    if (!usuarioId) window.location.replace("login.html");
    return usuarioId;
}

// Hace la petición a la API y regresa los datos o un error
async function pedir(metodo, ruta, cuerpo, reintento = true) {
    const opciones = { method: metodo, headers: {} };
    if (leerToken()) opciones.headers["Authorization"] = leerToken();
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

    // 401: el token venció, se renueva y se intenta otra vez
    if (respuesta.status === 401) {
        if (reintento && await renovarToken()) {
            return pedir(metodo, ruta, cuerpo, false);
        }
        cerrarSesion();
        return null;
    }

    // 404: no hay datos
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

// ---------- Fotos del refri ----------
// URL firmada para subir la foto a S3
function pedirUrlFoto() {
    return pedir("POST", "/photos", {});
}

// Fotos con los ingredientes que detectó Rekognition
function obtenerFotos() {
    return pedir("GET", "/photos");
}

// ---------- Menús ----------
function obtenerMenu(usuarioId, semana) {
    return pedir("GET", `/menus/${encodeURIComponent(usuarioId)}/${encodeURIComponent(semana)}`);
}

// dia: 0 = lunes ... 6 = domingo
function cambiarPlatillo(usuarioId, semana, dia, tipo, recetaId) {
    return pedir("PUT", `/menus/${encodeURIComponent(usuarioId)}/${encodeURIComponent(semana)}/${dia}/${tipo}`, { receta_id: recetaId });
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
// Semana como "2026-W45" (igual que la tabla Menus)
function semanaISO(fecha = new Date()) {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaSemana = d.getUTCDay() || 7;            // lunes = 1, domingo = 7
    d.setUTCDate(d.getUTCDate() + 4 - diaSemana);    // jueves de esa semana
    const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numero = Math.ceil(((d - inicioAnio) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

// "2026-11-04"
function fechaHoy() {
    const f = new Date();
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

// "2026-11-04" -> Date local (sin recorrerse un día)
function leerFecha(texto) {
    const [anio, mes, dia] = texto.slice(0, 10).split("-").map(Number);
    return new Date(anio, mes - 1, dia);
}

function formatoNumero(numero) {
    return Number(numero).toLocaleString("es-MX");
}

// ---------- Utilidades de pantalla ----------
// Crea un elemento con clase y texto
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

// Inicial del usuario en la barra
function ponerAvatar(usuario) {
    const avatar = document.getElementById("avatar");
    if (avatar && usuario && usuario.nombre) {
        avatar.textContent = usuario.nombre.charAt(0).toUpperCase();
    }
}

// ---------- Buscador ----------
// "Plátano" -> "platano"
function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
