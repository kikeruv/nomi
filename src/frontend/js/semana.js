// Pinta los 7 días del menú (lo usan dashboard.html y menu.html)

const TIPOS_COMIDA = ["desayuno", "comida", "cena"];
const NOMBRE_COMIDA = { desayuno: "Desayuno", comida: "Comida", cena: "Cena" };

const ICONO_CAMBIAR = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3l4 4-4 4"/><path d="M3 11V9a2 2 0 0 1 2-2h16"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a2 2 0 0 1-2 2H3"/></svg>';

// "2026-11-04" -> "Mié"
function diaCorto(fecha) {
    const texto = leerFecha(fecha).toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "");
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Suma de kcal de las comidas de un día
function totalDelDia(dia) {
    return TIPOS_COMIDA.reduce((suma, tipo) => suma + (dia.comidas[tipo] ? Number(dia.comidas[tipo].calorias) || 0 : 0), 0);
}

// Crea un .dia; si alCambiar existe, cada comida lleva su botón para cambiarla
function crearDia(dia, indiceDia, alCambiar) {
    const esHoy = dia.fecha === fechaHoy();
    const caja = crear("div", esHoy ? "dia dia-hoy" : "dia");

    const titulo = crear("h4", "", diaCorto(dia.fecha));
    if (esHoy) {
        const hoy = crear("span", "etiqueta", "Hoy");
        hoy.style.color = "var(--color-verde-texto)";
        titulo.appendChild(hoy);
    }
    caja.appendChild(titulo);

    TIPOS_COMIDA.forEach((tipo) => {
        const comida = dia.comidas[tipo];
        if (!comida) return;

        const fila = crear("div", "comida-dia");
        fila.dataset.dia = indiceDia;
        fila.dataset.tipo = tipo;
        fila.append(crear("span", "", NOMBRE_COMIDA[tipo]), comida.titulo);

        if (alCambiar) {
            const boton = crear("button", "boton-cambiar");
            boton.type = "button";
            boton.setAttribute("aria-label", `Cambiar ${comida.titulo}`);
            boton.innerHTML = ICONO_CAMBIAR;
            boton.addEventListener("click", () => alCambiar(indiceDia, tipo, fila));
            fila.appendChild(boton);
        }
        caja.appendChild(fila);
    });

    const total = crear("div", "total-dia", "Total ");
    total.appendChild(crear("b", "", `${formatoNumero(dia.total_kcal ?? totalDelDia(dia))} kcal`));
    caja.appendChild(total);

    return caja;
}

function pintarSemana(menu, alCambiar) {
    const contenedor = document.getElementById("semana");
    contenedor.innerHTML = "";
    menu.dias.forEach((dia, i) => contenedor.appendChild(crearDia(dia, i, alCambiar)));
}

// Aviso cuando no hay menú esta semana
function mostrarSinMenu(escaneo) {
    const aviso = document.getElementById("sin-menu");
    if (escaneo) {
        aviso.querySelector("h3").textContent = "Ya guardamos los ingredientes de tu refri";
        aviso.querySelector("p").textContent = "Tu menú se arma cuando haya recetas en el recetario.";
    }
    aviso.hidden = false;
}
