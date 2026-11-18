// Usuario del token (sin sesión manda al login)
const USUARIO_ID = pedirSesion();

// Dashboard: usuario, menú de la semana y último escaneo

function ponerBarra(idBarra, valor, meta) {
    const barra = document.getElementById(idBarra);
    if (!meta) {
        barra.parentElement.hidden = true;     // sin meta no hay barra
        return;
    }
    barra.parentElement.hidden = false;
    barra.style.width = `${Math.min(100, Math.round((valor / meta) * 100))}%`;
}

function pintarEncabezado(usuario) {
    const hoy = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("fecha-hoy").textContent = hoy.charAt(0).toUpperCase() + hoy.slice(1);
    if (usuario && usuario.nombre) {
        document.getElementById("saludo").textContent = `Hola, ${usuario.nombre}`;
    }
    ponerAvatar(usuario);
}

function pintarEscaneo(escaneo) {
    if (!escaneo || !escaneo.fecha) return;
    const fecha = leerFecha(escaneo.fecha).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
    document.getElementById("fecha-escaneo").textContent = `Escaneado el ${fecha}`;
}

function pintarHoy(diaHoy, usuario) {
    const meta = usuario && usuario.meta_calorias ? Number(usuario.meta_calorias) : 0;
    const comidas = TIPOS_COMIDA.map((tipo) => diaHoy.comidas[tipo]).filter(Boolean);
    const total = diaHoy.total_kcal;

    // Calorías de hoy
    document.getElementById("calorias-hoy").textContent = formatoNumero(total);
    document.getElementById("meta-texto").textContent = meta ? `Meta ${formatoNumero(meta)} kcal` : "";
    document.getElementById("contenedor-barra").hidden = !meta;
    if (meta) document.getElementById("barra-calorias").style.width = `${Math.min(100, Math.round((total / meta) * 100))}%`;

    const texto = document.getElementById("texto-calorias");
    texto.textContent = `Tu menú de hoy suma ${formatoNumero(total)} kcal.`;
    if (meta) {
        const diferencia = meta - total;
        texto.textContent += diferencia >= 0
            ? ` Te quedan ${formatoNumero(diferencia)} kcal.`
            : ` Te pasas por ${formatoNumero(-diferencia)} kcal.`;
    }

    // Macros
    const suma = (campo) => comidas.reduce((total, comida) => total + (Number(comida[campo]) || 0), 0);
    const proteina = suma("proteina_g");
    document.getElementById("proteina").textContent = `${proteina} g`;
    document.getElementById("carbs").textContent = `${suma("carbs_g")} g`;
    document.getElementById("grasa").textContent = `${suma("grasa_g")} g`;
    ponerBarra("barra-proteina", proteina, usuario && usuario.meta_proteina ? Number(usuario.meta_proteina) : 0);
    ponerBarra("barra-carbs", 0, 0);
    ponerBarra("barra-grasa", 0, 0);

    // Qué comes hoy
    document.getElementById("kcal-hoy").textContent = `${formatoNumero(total)} kcal`;
    const contenedor = document.getElementById("comidas-hoy");
    contenedor.innerHTML = "";
    TIPOS_COMIDA.forEach((tipo) => {
        const comida = diaHoy.comidas[tipo];
        if (!comida) return;

        const tarjeta = crear("a", "comida-hoy");
        tarjeta.href = `receta.html?receta_id=${encodeURIComponent(comida.receta_id)}`;
        tarjeta.style.textDecoration = "none";
        tarjeta.style.color = "inherit";

        const datos = crear("p", "", `${comida.tiempo_min} min · `);
        datos.appendChild(crear("span", "kcal", `${formatoNumero(comida.calorias)} kcal`));

        tarjeta.append(crear("span", "etiqueta", NOMBRE_COMIDA[tipo]), crear("h5", "", comida.titulo), datos);
        contenedor.appendChild(tarjeta);
    });
}

async function cargarDashboard() {
    pintarEncabezado(null);

    try {
        const [usuario, menu, escaneo] = await Promise.all([
            obtenerUsuario(USUARIO_ID),
            obtenerMenu(USUARIO_ID, semanaISO()),
            obtenerUltimoEscaneo(USUARIO_ID)
        ]);

        pintarEncabezado(usuario);
        pintarEscaneo(escaneo);

        if (!menu || !menu.dias || menu.dias.length === 0) {
            mostrarSinMenu(escaneo);
            document.getElementById("texto-calorias").textContent = "Todavía no tienes menú esta semana.";
            return;
        }

        pintarSemana(menu);

        // Busca el día de hoy en el menú
        const diaHoy = menu.dias.find((dia) => dia.fecha === fechaHoy()) || menu.dias[(new Date().getDay() + 6) % 7];
        if (diaHoy) pintarHoy(diaHoy, usuario);
    } catch (error) {
        mostrarErrorPagina(`No pudimos cargar tu semana. ${error.message}`);
    }
}

cargarDashboard();
