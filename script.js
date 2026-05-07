// ===== KOAJ כּוֹחַ – SCRIPT COMPLETO =====

const hoy = new Date();
const claveHoy = hoy.toISOString().slice(0, 10);

document.getElementById('fecha-hoy').innerText =
  hoy.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ===== 1. IMC =====
function calcularIMC() {
  const peso = parseFloat(document.getElementById('peso').value);
  const altura = parseFloat(document.getElementById('altura').value);
  const res = document.getElementById('res-imc');

  if (!peso || !altura || altura < 0.5 || altura > 3) {
    res.innerHTML = '<p class="alerta">⚠️ Ingresa valores válidos (altura en metros, ej: 1.70)</p>';
    return;
  }

  const imc = (peso / (altura * altura)).toFixed(1);
  let msg = "", clase = "";

  if (imc < 18.5) {
    msg = `Tu IMC es ${imc} — Bajo peso. Rango ideal OMS: 18.5–24.9. Aumenta tu ingesta calórica saludable.`;
    clase = "alerta";
  } else if (imc <= 24.9) {
    msg = `Tu IMC es ${imc} — Peso Normal. Estás en el rango ideal OMS. ¡Sigue así!`;
    clase = "normal";
  } else if (imc <= 29.9) {
    msg = `Tu IMC es ${imc} — Sobrepeso. La OMS recomienda mantenerlo bajo 25. Aumenta tu actividad cardio.`;
    clase = "alerta";
  } else {
    msg = `Tu IMC es ${imc} — Obesidad. Riesgo cardiovascular elevado. Consulta a un profesional de salud.`;
    clase = "alerta";
  }

  res.innerHTML = `<p class="${clase}">${msg}</p>`;
}

// ===== 2. SUEÑO =====
function calcularDescanso() {
  const horas = parseFloat(document.getElementById('horasSueno').value);
  const res = document.getElementById('res-sueno');

  if (!horas || horas < 0 || horas > 24) {
    res.innerHTML = '<p class="alerta">⚠️ Ingresa las horas dormidas (0–24)</p>';
    return;
  }

  let msg = "";
  if (horas < 5) {
    msg = `Dormiste ${horas}h — Alerta critica. Solo estiramientos suaves hoy.`;
  } else if (horas < 6) {
    msg = `Dormiste ${horas}h — Descanso insuficiente. Caminata suave 20 min maximo.`;
  } else if (horas <= 8) {
    msg = `Dormiste ${horas}h — Buen descanso. Entrena a intensidad moderada: caminar 30-45 min o trote suave.`;
  } else {
    msg = `Dormiste ${horas}h — Descanso optimo. Ideal para HIIT, calistenia o pesas. Al 100%!`;
  }

  res.innerHTML = `<p>${msg}</p>`;
}

// ===== 3. PODÓMETRO =====
const META_PASOS = 10000;
let pasos = 0;
let sensorActivo = false;
let ultimaFuerza = 0;

try {
  pasos = parseInt(localStorage.getItem('pasos_' + claveHoy)) || 0;
} catch(e) { pasos = 0; }

actualizarDisplay();

function actualizarDisplay() {
  document.getElementById('contador-pasos').innerText = pasos.toLocaleString('es-CO');
  const pct = Math.min((pasos / META_PASOS) * 100, 100);
  document.getElementById('barra-fill').style.width = pct + '%';
  document.getElementById('pct-meta').innerText =
    `${pct.toFixed(1)}% de tu meta (${META_PASOS.toLocaleString('es-CO')} pasos)`;
}

function iniciarPodometro() {
  if (sensorActivo) {
    document.getElementById('res-pasos').innerHTML =
      '<p class="info">El sensor ya esta activo. Sigue caminando.</p>';
    return;
  }
  if (typeof DeviceMotionEvent === 'undefined') {
    document.getElementById('res-pasos').innerHTML =
      '<p class="alerta">Tu dispositivo no tiene sensor de movimiento.</p>';
    return;
  }
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(r => {
        if (r === 'granted') activarSensor();
        else document.getElementById('res-pasos').innerHTML =
          '<p class="alerta">Permiso denegado. Activalo en Ajustes.</p>';
      });
  } else {
    activarSensor();
  }
}

function activarSensor() {
  sensorActivo = true;
  document.getElementById('btn-sensor').textContent = 'Sensor Activo – Caminando...';
  document.getElementById('btn-sensor').style.background = '#1a7a3a';
  document.getElementById('res-pasos').innerHTML =
    '<p class="normal">Sensor activado. Lleva el celular en la mano o bolsillo.</p>';
  window.addEventListener('devicemotion', detectarPaso);
}

function detectarPaso(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc || acc.x === null) return;
  const fuerza = Math.sqrt(
    Math.pow(acc.x || 0, 2) +
    Math.pow(acc.y || 0, 2) +
    Math.pow(acc.z || 0, 2)
  );
  if (fuerza > 11.5 && ultimaFuerza <= 11.5) {
    pasos++;
    try { localStorage.setItem('pasos_' + claveHoy, pasos); } catch(e) {}
    actualizarDisplay();
  }
  ultimaFuerza = fuerza;
}

function guardarRutina() {
  if (pasos === 0) {
    document.getElementById('res-pasos').innerHTML =
      '<p class="alerta">Aun no tienes pasos registrados hoy.</p>';
    return;
  }
  let rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]'); } catch(e) {}

  const nueva = {
    fecha: hoy.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: hoy.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    pasos: pasos
  };
  rutinas.unshift(nueva);
  if (rutinas.length > 15) rutinas.pop();
  try { localStorage.setItem('rutinas_guardadas', JSON.stringify(rutinas)); } catch(e) {}

  document.getElementById('res-pasos').innerHTML =
    `<p class="normal">Rutina guardada: ${pasos.toLocaleString('es-CO')} pasos el ${nueva.fecha}</p>`;
  mostrarHistorial();
}

function resetearPasos() {
  if (!confirm('Iniciar nueva rutina? Los pasos actuales se resetean.')) return;
  pasos = 0;
  try { localStorage.removeItem('pasos_' + claveHoy); } catch(e) {}
  if (sensorActivo) {
    window.removeEventListener('devicemotion', detectarPaso);
    sensorActivo = false;
    document.getElementById('btn-sensor').textContent = 'Activar Sensor de Pasos';
    document.getElementById('btn-sensor').style.background = '';
  }
  actualizarDisplay();
  document.getElementById('res-pasos').innerHTML =
    '<p class="normal">Nueva rutina iniciada. A moverse!</p>';
}

function mostrarHistorial() {
  let rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]'); } catch(e) {}
  const cont = document.getElementById('historial-rutinas');
  if (rutinas.length === 0) { cont.innerHTML = ''; return; }
  let html = '<p class="historial-titulo">Rutinas guardadas</p>';
  rutinas.forEach(r => {
    const pct = Math.min(Math.round((r.pasos / META_PASOS) * 100), 100);
    html += `<div class="rutina-item">
      <div>
        <div class="rutina-pasos">👟 ${r.pasos.toLocaleString('es-CO')} pasos</div>
        <div class="rutina-fecha">${r.fecha} · ${r.hora} · ${pct}% meta</div>
      </div>
    </div>`;
  });
  cont.innerHTML = html;
}

mostrarHistorial();

// ===== 4. PDF – LEE DIRECTO DE LA PANTALLA =====
function generarPDF() {
  const nombreInput = document.getElementById('nombre-reporte').value.trim();
  const nombreArchivo = nombreInput
    ? nombreInput.replace(/\s+/g, '_')
    : 'Reporte_KOAJ_' + claveHoy;

  const fechaTexto = hoy.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Leer directamente lo que se muestra en pantalla
  const textoIMC = document.getElementById('res-imc').innerText.trim() ||
    'No calculado. Ingresa tu peso y altura y toca Analizar Salud.';
  const textoSueno = document.getElementById('res-sueno').innerText.trim() ||
    'No calculado. Ingresa tus horas de sueno y toca Ver Plan.';
  const textoContador = document.getElementById('contador-pasos').innerText.trim();
  const textoPct = document.getElementById('pct-meta').innerText.trim();

  // Rutinas guardadas
  let rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]'); } catch(e) {}

  let filasRutinas = '';
  if (rutinas.length > 0) {
    rutinas.forEach(r => {
      const p = Math.min(Math.round((r.pasos / META_PASOS) * 100), 100);
      filasRutinas += `
        <tr>
          <td style="padding:6px 10px;border:1px solid #ddd;">${r.fecha}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${r.hora}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${r.pasos.toLocaleString('es-CO')}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${p}%</td>
        </tr>`;
    });
  } else {
    filasRutinas = '<tr><td colspan="4" style="padding:8px;text-align:center;color:#999;">No hay rutinas guardadas aun.</td></tr>';
  }

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;padding:30px;max-width:700px;margin:auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1a7a3a;font-size:28px;margin:0;">KOAJ</h1>
        <p style="color:#555;font-size:13px;margin:4px 0;">Fuerza Vital - Fitness Pro</p>
        <p style="color:#888;font-size:12px;">${fechaTexto}</p>
        ${nombreInput ? `<p style="color:#1a7a3a;font-weight:bold;">${nombreInput}</p>` : ''}
      </div>
      <hr style="border:2px solid #2ecc71;margin-bottom:24px;">

      <div style="margin-bottom:20px;background:#f9fff9;border-left:4px solid #2ecc71;padding:14px 16px;border-radius:4px;">
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 8px;">Salud - IMC (OMS)</h2>
        <p style="font-size:13px;line-height:1.6;margin:0;">${textoIMC}</p>
      </div>

      <div style="margin-bottom:20px;background:#f9fff9;border-left:4px solid #2ecc71;padding:14px 16px;border-radius:4px;">
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 8px;">Plan segun Sueno</h2>
        <p style="font-size:13px;line-height:1.6;margin:0;">${textoSueno}</p>
      </div>

      <div style="margin-bottom:20px;background:#f9fff9;border-left:4px solid #2ecc71;padding:14px 16px;border-radius:4px;">
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 8px;">Actividad del Dia</h2>
        <p style="font-size:13px;line-height:1.6;margin:0;">
          Pasos hoy: <strong>${textoContador}</strong><br>
          ${textoPct}
        </p>
      </div>

      <div style="margin-bottom:24px;">
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 10px;">Historial de Rutinas (ultimos 15 dias)</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#2ecc71;color:#000;">
              <th style="padding:8px 10px;border:1px solid #ddd;text-align:left;">Fecha</th>
              <th style="padding:8px 10px;border:1px solid #ddd;">Hora</th>
              <th style="padding:8px 10px;border:1px solid #ddd;">Pasos</th>
              <th style="padding:8px 10px;border:1px solid #ddd;">% Meta</th>
            </tr>
          </thead>
          <tbody>${filasRutinas}</tbody>
        </table>
      </div>

      <hr style="border:1px solid #ddd;margin-bottom:16px;">
      <p style="text-align:center;color:#1a7a3a;font-weight:bold;font-size:13px;">
        Sigue adelante! Cada paso es fuerza vital. KOAJ App
      </p>
    </div>`;

  const elemento = document.createElement('div');
  elemento.innerHTML = html;
  elemento.style.position = 'fixed';
  elemento.style.left = '-9999px';
  elemento.style.top = '0';
  elemento.style.width = '700px';
  elemento.style.background = '#fff';
  document.body.appendChild(elemento);

  const opt = {
    margin: 10,
    filename: nombreArchivo + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(elemento).save().then(() => {
    document.body.removeChild(elemento);
  });
      }
