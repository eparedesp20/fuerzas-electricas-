// -------------------------------------------
// CONSTANTES FÍSICAS Y FACTORES DE CONVERSIÓN
// -------------------------------------------

const k = 9 * Math.pow(10, 9); // Constante de Coulomb (N·m²/C²)
const Q = 60; // Ángulo fijo en grados (si se requiere en cálculos adicionales)
const radianes = Q * Math.PI / 180; // Conversión de Q a radianes

// Factores de conversión de unidades de carga
const mc = Math.pow(10, -3);  // milicoulomb
const uc = Math.pow(10, -6);  // microcoulomb
const nc = Math.pow(10, -9);  // nanocoulomb
const pc = Math.pow(10, -12); // picocoulomb

// -------------------------------------------
// ACCESO A ELEMENTOS DEL DOM (ENTRADAS Y RESULTADOS)
// -------------------------------------------

// Entradas de valores de carga
const input_carga_q1 = document.getElementById("q1");
const input_carga_q2 = document.getElementById("q2");
const input_carga_q3 = document.getElementById("q3");

// Selectores de tipo de unidad de carga
const input_tipoC_q1 = document.getElementById("tipo_carga_q1");
const input_tipoC_q2 = document.getElementById("tipo_carga_q2");
const input_tipoC_q3 = document.getElementById("tipo_carga_q3");

// Entradas de distancias entre cargas
const input_longitud_a = document.getElementById("lado1"); // q1–q3
const input_longitud_b = document.getElementById("lado2"); // q1–q2
const input_longitud_c = document.getElementById("lado3"); // q2–q3

// Selectores de signo de cada carga
const input_sq1 = document.getElementById("simbolo_q1");
const input_sq2 = document.getElementById("simbolo_q2");
const input_sq3 = document.getElementById("simbolo_q3");

// Elementos donde se mostrarán los resultados
const span_resultado_f13 = document.getElementById("resultado_f13");
const span_resultado_f23 = document.getElementById("resultado_f23");
const span_resultado_f13x = document.getElementById("resultado_f13x");
const span_resultado_f13y = document.getElementById("resultado_f13y");
const span_resultado_f23x = document.getElementById("resultado_f23x");
const span_resultado_f23y = document.getElementById("resultado_f23y");
const span_resultado_fr = document.getElementById("resultado_fr");
const span_resultado_angulo = document.getElementById("resultado_angulo");

// -------------------------------------------
// FUNCIÓN: CONVERSIÓN DE UNIDADES DE CARGA
// -------------------------------------------

/**
 * Convierte el valor de una carga a Coulombs según su tipo de unidad.
 * @param {number} carga - Valor numérico de la carga.
 * @param {string} tipo - Tipo de unidad (mc, uc, nc, pc).
 * @returns {number} - Valor convertido en Coulombs.
 */
function valor_carga(carga, tipo) {
    if (tipo === "mc") {
        return carga * mc;
    } else if (tipo === "uc") {
        return carga * uc;
    } else if (tipo === "nc") {
        return carga * nc;
    } else if (tipo === "pc") {
        return carga * pc;
    }
}

// -------------------------------------------
// FUNCIÓN: AJUSTE DE SIGNOS PARA F13
// -------------------------------------------

/**
 * Ajusta el signo de los componentes de la fuerza F13 según si q1 y q3 tienen el mismo signo.
 * Si tienen el mismo signo → repulsión → dirección original.
 * Si tienen signos opuestos → atracción → dirección opuesta.
 * @returns {object} - Componentes x e y ajustados.
 */
function signos_lado_uno(sq1, sq3, f13x, f13y) {
    if (sq1 === sq3) {
        return { x: f13x, y: f13y };
    }
    return { x: -f13x, y: -f13y };
}

// -------------------------------------------
// FUNCIÓN: AJUSTE DE SIGNOS PARA F23
// -------------------------------------------

/**
 * Ajusta el signo de los componentes de la fuerza F23 según si q2 y q3 tienen el mismo signo.
 * Si tienen el mismo signo → repulsión → dirección opuesta en X.
 * Si tienen signos opuestos → atracción → dirección opuesta en Y.
 * @returns {object} - Componentes x e y ajustados.
 */
function signos_lado_dos(sq2, sq3, f23x, f23y) {
    if (sq2 === sq3) {
        return { x: -f23x, y: f23y };
    }
    return { x: f23x, y: -f23y };
}

// -------------------------------------------
// FUNCIÓN: Verifica si los lados forman un triángulo y calcula sus ángulos internos
// -------------------------------------------
function verificarYCalcularAngulos(a, b, c) {
    // Verifica si los lados cumplen la desigualdad triangular
    if (a + b > c && a + c > b && b + c > a) {
        // Calcula los ángulos internos usando la ley de cosenos
        const angulob = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * (180 / Math.PI);
        const anguloc = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * (180 / Math.PI);
        const anguloa = 180 - angulob - anguloc; // Asegura que la suma sea 180°

        return {
            angulo1: parseFloat(anguloa.toFixed(2)), // Ángulo en q1
            angulo2: parseFloat(angulob.toFixed(2)), // Ángulo en q2
            angulo3: parseFloat(anguloc.toFixed(2))  // Ángulo en q3
        };
    } else {
        alert("❌ No se puede formar un triángulo con estos lados");
        return null;
    }
}

// -------------------------------------------
// EVENTOS: Redibuja el triángulo al cambiar entradas
// -------------------------------------------
input_longitud_a.addEventListener("input", dibujarTriangulo);
input_longitud_b.addEventListener("input", dibujarTriangulo);
input_longitud_c.addEventListener("input", dibujarTriangulo);
input_sq1.addEventListener("change", dibujarTriangulo);
input_sq2.addEventListener("change", dibujarTriangulo);
input_sq3.addEventListener("change", dibujarTriangulo);

// -------------------------------------------
// FUNCIÓN: Dibuja una flecha en el canvas
// -------------------------------------------
function dibujarFlecha(ctx, desdeX, desdeY, hastaX, hastaY) {
    const headlen = 10;
    const angle = Math.atan2(hastaY - desdeY, hastaX - desdeX);

    ctx.beginPath();
    ctx.moveTo(hastaX, hastaY);
    ctx.lineTo(hastaX - headlen * Math.cos(angle - Math.PI / 6), hastaY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(hastaX, hastaY);
    ctx.lineTo(hastaX - headlen * Math.cos(angle + Math.PI / 6), hastaY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// -------------------------------------------
// FUNCIÓN: Dibuja los vectores de fuerza sobre q3
// -------------------------------------------
function dibujarVectores(puntos) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const q1 = puntos.p1;
    const q2 = puntos.p2;
    const q3 = puntos.p3;

    const tipo1 = input_sq1.value;
    const tipo2 = input_sq2.value;
    const tipo3 = input_sq3.value;

    const mismaCarga13 = (tipo1 === tipo3);
    const mismaCarga23 = (tipo2 === tipo3);

    const dirF13 = mismaCarga13 ? 1 : -1;
    const dirF23 = mismaCarga23 ? 1 : -1;

    // Dibuja vector F13
    const endF13 = {
        x: q3.x + dirF13 * (q3.x - q1.x) * 0.3,
        y: q3.y + dirF13 * (q3.y - q1.y) * 0.3
    };
    ctx.strokeStyle = "purple";
    ctx.beginPath();
    ctx.moveTo(q3.x, q3.y);
    ctx.lineTo(endF13.x, endF13.y);
    ctx.stroke();
    dibujarFlecha(ctx, q3.x, q3.y, endF13.x, endF13.y);

    // Dibuja vector F23
    const endF23 = {
        x: q3.x + dirF23 * (q3.x - q2.x) * 0.3,
        y: q3.y + dirF23 * (q3.y - q2.y) * 0.3
    };
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(q3.x, q3.y);
    ctx.lineTo(endF23.x, endF23.y);
    ctx.stroke();
    dibujarFlecha(ctx, q3.x, q3.y, endF23.x, endF23.y);
}

// -------------------------------------------
// FUNCIÓN: Dibuja el triángulo escalado y centrado
// -------------------------------------------
function dibujarTriangulo() {
    const a = parseFloat(input_longitud_a.value);
    const b = parseFloat(input_longitud_b.value);
    const c = parseFloat(input_longitud_c.value);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!a || !b || !c || isNaN(a) || isNaN(b) || isNaN(c)) return;
    if (a + b <= c || a + c <= b || b + c <= a) return;

    // Calcula coordenadas del triángulo
    const cosC = (a ** 2 + c ** 2 - b ** 2) / (2 * a * c);
    const angC = Math.acos(cosC);

    const q1 = { x: 0, y: 0 };
    const q2 = { x: b, y: 0 };
    const q3 = {
        x: a * Math.cos(angC),
        y: -a * Math.sin(angC)
    };

    // Escalado y centrado del triángulo en el canvas
    const puntos = [q1, q2, q3];
    const minX = Math.min(...puntos.map(p => p.x));
    const maxX = Math.max(...puntos.map(p => p.x));
    const minY = Math.min(...puntos.map(p => p.y));
    const maxY = Math.max(...puntos.map(p => p.y));

    const escalaX = (canvas.width * 0.9) / (maxX - minX);
    const escalaY = (canvas.height * 0.9) / (maxY - minY);
    const escala = Math.min(escalaX, escalaY) * 0.65;

    const centroCanvas = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    const centroTriangulo = {
        x: ((q1.x + q2.x + q3.x) / 3 - minX) * escala,
        y: ((q1.y + q2.y + q3.y) / 3 - minY) * escala
    };

    const offsetX = centroCanvas.x - centroTriangulo.x;
    const offsetY = centroCanvas.y - centroTriangulo.y;

    const p1 = { x: (q1.x - minX) * escala + offsetX, y: (q1.y - minY) * escala + offsetY };
    const p2 = { x: (q2.x - minX) * escala + offsetX, y: (q2.y - minY) * escala + offsetY };
    const p3 = { x: (q3.x - minX) * escala + offsetX, y: (q3.y - minY) * escala + offsetY };

    // Dibuja el triángulo
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibuja etiquetas de cargas con signo
    const s1 = input_sq1.value === "+" ? "q1⁺" : "q1⁻";
    const s2 = input_sq2.value === "+" ? "q2⁺" : "q2⁻";
    const s3 = input_sq3.value === "+" ? "q3⁺" : "q3⁻";

    ctx.fillStyle = "orange";
    ctx.font = "20px Arial";
    ctx.fillText(s1, p1.x - 25, p1.y + 20);
    ctx.fillText(s2, p2.x + 10, p2.y + 20);
    ctx.fillText(s3, p3.x + 10, p3.y - 10);

    // Dibuja longitudes entre cargas
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText(`${b}m`, (p1.x + p2.x) / 2 - 70, (p1.y + p2.y) / 2 - 20);    
    ctx.fillText(`${c}m`, (p2.x + p3.x) / 2 + 20, (p2.y + p3.y) / 2 - 20);
    ctx.fillText(`${a}m`, (p1.x + p3.x) / 2 - 50, (p1.y + p3.y) / 2 - 20);

    // Dibuja los ángulos internos en cada vértice
    const angulos = verificarYCalcularAngulos(a, b, c);
    ctx.fillStyle = "#005";
    ctx.fillText(`${angulos.angulo1}°`, p1.x - 60, p1.y - 25); // Ángulo en q1
    ctx.fillText(`${angulos.angulo2}°`, p2.x + 30, p2.y - 25); // Ángulo en q2
    ctx.fillText(`${angulos.angulo3}°`, p3.x + 40, p3.y - 0);  // Ángulo en q3

    return { p1, p2, p3 }; // Devuelve las posiciones escaladas para dibujar vectores
}

// -------------------------------------------
// FUNCIÓN PRINCIPAL: Ejecuta la simulación completa
// -------------------------------------------
function simular() {
    // Obtener distancias entre cargas
    let aa = parseFloat(input_longitud_a.value);
    let bb = parseFloat(input_longitud_b.value);
    let cc = parseFloat(input_longitud_c.value);

    // Calcular ángulos internos del triángulo
    let angulos = verificarYCalcularAngulos(aa, bb, cc);
    let angulo_a = angulos.angulo1;
    let angulo_b = angulos.angulo2;
    let angulo_c = angulos.angulo3;

    // Obtener valores de carga y tipo de unidad
    let carga_q1 = parseFloat(input_carga_q1.value);
    let carga_q2 = parseFloat(input_carga_q2.value);
    let carga_q3 = parseFloat(input_carga_q3.value);
    let tipoC_q1 = input_tipoC_q1.value;
    let tipoC_q2 = input_tipoC_q2.value;
    let tipoC_q3 = input_tipoC_q3.value;

    // Obtener signos de las cargas
    let sq1 = input_sq1.value;
    let sq2 = input_sq2.value;
    let sq3 = input_sq3.value;

    // Convertir cargas a Coulombs
    let q1 = valor_carga(carga_q1, tipoC_q1);
    let q2 = valor_carga(carga_q2, tipoC_q2);
    let q3 = valor_carga(carga_q3, tipoC_q3);

    // Calcular magnitudes de las fuerzas F13 y F23
    let f13 = (k * Math.abs(q1) * Math.abs(q3)) / Math.pow(aa, 2);
    let f23 = (k * Math.abs(q2) * Math.abs(q3)) / Math.pow(cc, 2);

    // Descomponer las fuerzas en componentes x e y
    let f13x = f13 * Math.cos((angulo_a * Math.PI) / 180);
    let f13y = f13 * Math.sin((angulo_a * Math.PI) / 180);
    let f23x = f23 * Math.cos((angulo_b * Math.PI) / 180);
    let f23y = f23 * Math.sin((angulo_b * Math.PI) / 180);

    // Ajustar signos según interacción de cargas
    let resultado = signos_lado_uno(sq1, sq3, f13x, f13y);
    f13x = resultado.x;
    f13y = resultado.y;

    resultado = signos_lado_dos(sq2, sq3, f23x, f23y);
    f23x = resultado.x;
    f23y = resultado.y;

    // Calcular fuerza resultante y ángulo
    let resultante_x = f13x + f23x;
    let resultante_y = f13y + f23y;

    let fuerza_resultante = Math.sqrt(resultante_x ** 2 + resultante_y ** 2);
    let angulo = Math.atan(resultante_y / resultante_x) * (180 / Math.PI);

    // Ajustar ángulo si está en cuadrante negativo
    if (angulo < 0) {
        angulo = 360 + angulo;
    }

    // Mostrar resultados en pantalla
    document.getElementById("resultado_f13").textContent = f13;
    document.getElementById("resultado_f23").textContent = f23;
    document.getElementById("resultado_f13x").textContent = f13x;
    document.getElementById("resultado_f13y").textContent = f13y;
    document.getElementById("resultado_f23x").textContent = f23x;
    document.getElementById("resultado_f23y").textContent = f23y;
    document.getElementById("resultado_fr").textContent = fuerza_resultante;
    document.getElementById("resultado_angulo").textContent = angulo;

    // Redibujar triángulo y vectores
    const puntos = dibujarTriangulo();
    dibujarVectores(puntos);
}

