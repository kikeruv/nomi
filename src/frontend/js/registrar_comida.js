// Registrar comida: manda un POST /calorias con lo que escribe la persona

const formulario = document.getElementById("formulario-comida");
const inputPlatillo = document.getElementById("platillo");
const inputCalorias = document.getElementById("calorias");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora");
const botonGuardar = document.getElementById("boton-guardar");
const resultado = document.getElementById("resultado");

let caloriasDeHoy = 0;

// ---------- Fechas ----------

// Fecha de hoy como "AAAA-MM-DD"
function hoy() {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Hora actual como "HH:MM"
function horaActual() {
    const fecha = new Date();
    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
}

function formatoNumero(numero) {
    return Number(numero).toLocaleString("es-MX");
}

// ---------- Errores en los campos ----------

function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    campo.classList.add("campo-error");
    campo.querySelector("small").textContent = mensaje;
}

function quitarError(idCampo) {
    const campo = document.getElementById(idCampo);
    const ayuda = campo.querySelector("small");
    campo.classList.remove("campo-error");
    ayuda.textContent = ayuda.dataset.ayuda || "";
}

// ---------- Aviso de calorías restantes ----------

function actualizarRestante() {
    const nuevas = parseInt(inputCalorias.value, 10) || 0;
    const sumaNuevas = inputFecha.value === hoy() ? nuevas : 0;
    const restante = CONFIG.META_CALORIAS - caloriasDeHoy - sumaNuevas;
    const aviso = document.getElementById("aviso-restante");

    if (restante >= 0) {
        aviso.innerHTML = `<span>Después de esto te quedarán <span class="kcal">${formatoNumero(restante)} kcal</span> para hoy.</span>`;
    } else {
        aviso.innerHTML = `<span>Con esto pasarías tu meta de hoy por <span class="kcal" style="color: var(--color-aviso)">${formatoNumero(-restante)} kcal</span>.</span>`;
    }
}

async function cargarCaloriasDeHoy() {
    try {
        const registros = await obtenerHistorial(CONFIG.USUARIO_ID);
        caloriasDeHoy = registros
            .filter((registro) => registro.fecha_comida.startsWith(hoy()))
            .reduce((suma, registro) => suma + Number(registro.calorias_estimadas), 0);
    } catch (error) {
        caloriasDeHoy = 0;
    }
    actualizarRestante();
}

// ---------- Validación ----------

function validar() {
    let valido = true;
    const calorias = Number(inputCalorias.value);

    if (!inputPlatillo.value.trim()) {
        mostrarError("campo-platillo", "Escribe el nombre del platillo.");
        valido = false;
    }
    if (inputCalorias.value === "" || !Number.isInteger(calorias) || calorias <= 0) {
        mostrarError("campo-calorias", "Escribe un número entero mayor a 0.");
        valido = false;
    }
    if (!inputFecha.value) {
        mostrarError("campo-fecha", "Elige la fecha.");
        valido = false;
    }
    if (!inputHora.value) {
        mostrarError("campo-hora", "Elige la hora.");
        valido = false;
    }

    return valido;
}

// ---------- Guardar ----------

async function guardar(evento) {
    evento.preventDefault();
    if (!validar()) return;

    // Los nombres de los campos son los mismos de la tabla RegistroCalorias
    const registro = {
        usuario_id: CONFIG.USUARIO_ID,
        fecha_comida: `${inputFecha.value}T${inputHora.value}:00`,
        platillo: inputPlatillo.value.trim(),
        calorias_estimadas: Number(inputCalorias.value)
    };

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando…";
    resultado.hidden = true;

    try {
        await registrarComida(registro);

        resultado.className = "mensaje mensaje-exito";
        resultado.textContent = `Listo: guardamos "${registro.platillo}" con ${formatoNumero(registro.calorias_estimadas)} kcal. `;
        const enlace = document.createElement("a");
        enlace.className = "enlace";
        enlace.href = "historial.html";
        enlace.textContent = "Ver historial";
        resultado.appendChild(enlace);
        resultado.hidden = false;

        if (inputFecha.value === hoy()) caloriasDeHoy += registro.calorias_estimadas;
        formulario.reset();
        inputFecha.value = hoy();
        inputHora.value = horaActual();
        actualizarRestante();
    } catch (error) {
        resultado.className = "mensaje mensaje-error";
        resultado.textContent = `No pudimos guardar la comida. ${error.message}`;
        resultado.hidden = false;
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar en mi historial";
    }
}

// ---------- Al cargar la página ----------

inputFecha.value = hoy();
inputHora.value = horaActual();

if (modoDemo()) {
    document.getElementById("modo").textContent = "Modo demo · datos de ejemplo";
}

inputPlatillo.addEventListener("input", () => quitarError("campo-platillo"));
inputCalorias.addEventListener("input", () => {
    quitarError("campo-calorias");
    actualizarRestante();
});
inputFecha.addEventListener("input", () => {
    quitarError("campo-fecha");
    actualizarRestante();
});
inputHora.addEventListener("input", () => quitarError("campo-hora"));
formulario.addEventListener("submit", guardar);

cargarCaloriasDeHoy();