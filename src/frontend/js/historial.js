const DIAS_SEMANA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

let todosLosRegistros = [];
let diasDelPeriodo = 7;

// ---------- Fechas y formato ----------

// Date -> "AAAA-MM-DD"
function aTexto(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function hoy() {
    return aTexto(new Date());
}

// "2026-10-24" -> "Sáb 24 oct"
function nombreDelDia(textoDia) {
    const [anio, mes, dia] = textoDia.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const texto = `${DIAS_SEMANA[fecha.getDay()]} ${dia} ${MESES[mes - 1]}`;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatoNumero(numero) {
    return Number(numero).toLocaleString("es-MX");
}

// Evita que lo que escribió el usuario se lea como HTML
function escaparTexto(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// ---------- Datos ----------

// Junta los registros por día: { "2026-10-24": { total: 1270, comidas: [...] }, ... }
function agruparPorDia(registros) {
    const dias = {};
    registros.forEach((registro) => {
        const dia = registro.fecha_comida.slice(0, 10);
        if (!dias[dia]) dias[dia] = { total: 0, comidas: [] };
        dias[dia].total += Number(registro.calorias_estimadas);
        dias[dia].comidas.push(registro);
    });
    return dias;
}

// Solo los registros dentro del periodo elegido (7, 30 o 90 días)
function registrosDelPeriodo() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (diasDelPeriodo - 1));
    const desde = aTexto(inicio);
    return todosLosRegistros.filter((registro) => registro.fecha_comida.slice(0, 10) >= desde);
}

// ---------- Pintar la página ----------

function pintarResumen(registros, dias) {
    const meta = CONFIG.META_CALORIAS;
    const listaDias = Object.keys(dias);
    const totalHoy = dias[hoy()] ? dias[hoy()].total : 0;
    const promedio = listaDias.length
        ? Math.round(listaDias.reduce((suma, dia) => suma + dias[dia].total, 0) / listaDias.length)
        : 0;
    const diasEnMeta = listaDias.filter((dia) => dias[dia].total <= meta).length;

    document.getElementById("dato-hoy").innerHTML = `${formatoNumero(totalHoy)}<small> kcal</small>`;
    document.getElementById("dato-promedio").innerHTML = `${formatoNumero(promedio)}<small> kcal</small>`;
    document.getElementById("dato-meta").innerHTML = `${diasEnMeta}<small> de ${listaDias.length}</small>`;
    document.getElementById("dato-comidas").textContent = registros.length;
    document.getElementById("etiqueta-meta").textContent = `Meta ${formatoNumero(meta)} kcal`;
}

function pintarGrafica(dias) {
    const meta = CONFIG.META_CALORIAS;
    const ultimos = [];

    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const texto = aTexto(fecha);
        ultimos.push({
            texto: texto,
            etiqueta: i === 0 ? "Hoy" : DIAS_SEMANA[fecha.getDay()],
            total: dias[texto] ? dias[texto].total : 0
        });
    }

    const maximo = Math.max(meta, ...ultimos.map((dia) => dia.total)) * 1.1;
    const altoMaximo = 170;
    const base = 190;
    const yMeta = base - (meta / maximo) * altoMaximo;

    let svg = `<line class="linea-meta" x1="0" x2="1080" y1="${yMeta}" y2="${yMeta}"/>`;
    ultimos.forEach((dia, i) => {
        const x = 20 + i * 150;
        const alto = dia.total ? Math.max((dia.total / maximo) * altoMaximo, 4) : 0;
        const clase = dia.texto === hoy() ? "barra-hoy" : "barra-grafica";
        svg += `<rect class="${clase}" x="${x}" y="${base - alto}" width="96" height="${alto}" rx="4"><title>${formatoNumero(dia.total)} kcal</title></rect>`;
        svg += `<text x="${x + 48}" y="212" text-anchor="middle">${dia.etiqueta}</text>`;
    });

    document.getElementById("grafica").innerHTML = svg;
}

function pintarTabla(dias) {
    const meta = CONFIG.META_CALORIAS;
    const cuerpo = document.getElementById("tabla-dias");
    const lista = Object.keys(dias).sort().reverse();

    if (lista.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="4">No hay comidas registradas en este periodo.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = lista.map((dia) => {
        const { total, comidas } = dias[dia];
        const esHoy = dia === hoy();

        let estado = `<span class="chip">Dentro de la meta</span>`;
        if (esHoy) estado = `<span class="chip">En curso</span>`;
        if (total > meta) estado = `<span class="chip chip-aviso">Arriba de la meta</span>`;

        const nombre = esHoy ? `Hoy, ${nombreDelDia(dia).toLowerCase()}` : nombreDelDia(dia);
        const cantidad = comidas.length === 1 ? "1 comida" : `${comidas.length} comidas`;

        return `
            <tr>
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>${estado}</td>
                <td class="numero">${formatoNumero(total)} kcal</td>
            </tr>`;
    }).join("");
}

function pintarComidas(registros) {
    const contenedor = document.getElementById("comidas");
    const recientes = registros
        .slice()
        .sort((a, b) => b.fecha_comida.localeCompare(a.fecha_comida))
        .slice(0, 6);

    if (recientes.length === 0) {
        contenedor.innerHTML = `<div class="tarjeta"><p>Registra tu primera comida para verla aquí.</p></div>`;
        return;
    }

    contenedor.innerHTML = recientes.map((registro) => `
        <div class="tarjeta">
            <span class="etiqueta">${nombreDelDia(registro.fecha_comida.slice(0, 10))} · ${registro.fecha_comida.slice(11, 16)}</span>
            <h3 style="margin-top: var(--espacio-chico)">${escaparTexto(registro.platillo)}</h3>
            <p><span class="kcal">${formatoNumero(registro.calorias_estimadas)} kcal</span></p>
        </div>`).join("");
}

function pintarTodo() {
    const registros = registrosDelPeriodo();
    const dias = agruparPorDia(registros);
    pintarResumen(registros, dias);
    pintarTabla(dias);
    pintarComidas(registros);
    pintarGrafica(agruparPorDia(todosLosRegistros));   // la gráfica siempre muestra los últimos 7 días
}

// ---------- Filtros ----------

document.querySelectorAll(".filtro").forEach((boton) => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach((otro) => otro.setAttribute("aria-pressed", "false"));
        boton.setAttribute("aria-pressed", "true");
        diasDelPeriodo = Number(boton.dataset.dias);
        pintarTodo();
    });
});

// ---------- Al cargar la página ----------

async function cargarHistorial() {
    if (modoDemo()) {
        document.getElementById("modo").textContent = "Modo demo · datos de ejemplo";
    }

    try {
        todosLosRegistros = await obtenerHistorial(CONFIG.USUARIO_ID);
        pintarTodo();
    } catch (error) {
        const aviso = document.getElementById("error");
        aviso.textContent = `No pudimos cargar tu historial. ${error.message}`;
        aviso.hidden = false;
        document.getElementById("tabla-dias").innerHTML = `<tr><td colspan="4">Sin datos.</td></tr>`;
    }
}

cargarHistorial();