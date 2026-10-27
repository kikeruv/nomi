const DATOS_DEMO = [
    { usuario_id: "u1", fecha_comida: "2026-10-24T08:30:00", platillo: "Huevos a la mexicana", calorias_estimadas: 320 },
    { usuario_id: "u1", fecha_comida: "2026-10-24T14:15:00", platillo: "Tacos de pollo", calorias_estimadas: 540 },
    { usuario_id: "u1", fecha_comida: "2026-10-24T20:00:00", platillo: "Ensalada César", calorias_estimadas: 410 },
    { usuario_id: "u1", fecha_comida: "2026-10-25T09:00:00", platillo: "Avena con plátano", calorias_estimadas: 290 },
    { usuario_id: "u2", fecha_comida: "2026-10-24T13:00:00", platillo: "Torta ahogada", calorias_estimadas: 780 },
    { usuario_id: "u2", fecha_comida: "2026-10-25T10:30:00", platillo: "Chilaquiles verdes", calorias_estimadas: 650 }
];

function modoDemo() {
    return CONFIG.API_URL === "";
}

// En modo demo, lo registrado se guarda en el navegador
function leerDemo() {
    try {
        const guardado = localStorage.getItem("nomi-demo");
        if (guardado) return JSON.parse(guardado);
    } catch (error) {
        // El navegador no deja usar localStorage: usamos los datos de ejemplo
    }
    return DATOS_DEMO.slice();
}

function guardarDemo(registros) {
    try {
        localStorage.setItem("nomi-demo", JSON.stringify(registros));
    } catch (error) {
        // Sin almacenamiento: no pasa nada, solo no se guarda
    }
}

// GET /calorias/{usuario_id}
async function obtenerHistorial(usuarioId) {
    if (modoDemo()) {
        return leerDemo().filter((registro) => registro.usuario_id === usuarioId);
    }

    const respuesta = await fetch(`${CONFIG.API_URL}/calorias/${usuarioId}`);

    if (respuesta.status === 404) return [];
    if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}.`);

    return respuesta.json();
}

// POST /calorias
async function registrarComida(registro) {
    if (modoDemo()) {
        const registros = leerDemo();
        registros.push(registro);
        guardarDemo(registros);
        return registro;
    }

    const respuesta = await fetch(`${CONFIG.API_URL}/calorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro)
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (respuesta.status === 400) throw new Error(datos.error || "Faltan datos en el registro.");
    if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}.`);

    return datos;
}