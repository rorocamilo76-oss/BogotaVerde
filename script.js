// ===== KOAJ כּוֹחַ – SCRIPT COMPLETO =====

// FECHA
const hoy = new Date();
document.getElementById('fecha-hoy').innerText =
  hoy.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ===== 1. IMC =====
let ultimoIMC = "";

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
    msg = `Tu IMC es <strong>${imc}</strong> — Bajo peso. Rango ideal OMS: 18.5–24.9. Aumenta tu ingesta calórica saludable con proteínas y grasas buenas.`;
    clase = "alerta";
  } else if (imc <= 24.9) {
    msg = `Tu IMC es <strong>${imc}</strong> — ¡Peso Normal! Estás en el rango ideal OMS. Mantén tu rutina de ejercicio y alimentación.`;
    clase = "normal";
  } else if (imc <= 29.9) {
    msg = `Tu IMC es <strong>${imc}</strong> — Sobrepeso. La OMS recomienda mantenerlo bajo 25. Aumenta tu actividad cardio y revisa tu dieta.`;
    clase = "alerta";
  } else {
    msg = `Tu IMC es <strong>${imc}</strong> — Obesidad. Riesgo cardiovascular elevado. Se recomienda consultar a un profesional de salud y comenzar con actividad física suave.`;
    clase = "alerta";
  }

  res.innerHTML = `<p class="${clase}">${msg}</p>`;
  ultimoIMC = msg.replace(/<[^>]+>/g, '');
}

// ===== 2. SUEÑO =====
let ultimoSueno = "";

function calcularDescanso() {
  const horas = parseFloat(document.getElementById('horasSueno').value);
  const res = document.getElementById('res-sueno');

  if (!horas || horas < 0 || horas > 24) {
    res.innerHTML = '<p class="alerta">⚠️ Ingresa las horas dormidas (0–24)</p>';
    return;
  }

  let msg = "";
  if (horas < 5) {
    msg = "⚠️ <strong>Alerta crítica:</strong> Dormiste muy poco. Tu sistema nervioso central está agotado. Solo estiramientos suaves o yoga restaurativo hoy. No hagas ejercicio intenso.";
  } else if (horas < 6) {
    msg = "⚠️ <strong>Descanso insuficiente:</strong> Tu cuerpo necesita más recuperación. Recomendación: caminata suave 20 minutos máximo. Priori­za dormir esta noche.";
  } else if (horas <= 8) {
    msg = "✅ <strong>Buen descanso:</strong> Puedes entrenar a intensidad moderada. Camina 30–45 min, trote suave, bicicleta o entrenamiento funcional. ¡Tu cuerpo está listo!";
  } else {
    msg = "🔥 <strong>Descanso óptimo:</strong> Estás al 100% de capacidad. Ideal para entrenamiento de alta intensidad, calistenia, pesas o HIIT. ¡Aprovecha tu energía!";
  }

  res.innerHTML = `<p>${msg}</p>`;
  ultimoSueno = msg.replace(/<[^>]+>/g, '');
}

// ===== 3. PODÓMETRO =====
const META_PASOS = 10000;
let pasos = 0;
let sensorActivo = false;
let ultimaFuerza = 0;
let umbral = 11.5;

// Cargar pasos del día actual de localStorage
const claveHoy = 'pasos_' + hoy.toISOString().slice(0, 10);
pasos = parseInt(localStorage.getItem(claveHoy)) || 0;
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
      '<p class="info">⚡ El sensor ya está activo. Sigue caminando.</p>';
    return;
  }

  if (typeof DeviceMotionEvent === 'undefined') {
    document.getElementById('res-pasos').innerHTML =
      '<p class="alerta">❌ Tu dispositivo no tiene sensor de movimiento. Usa un celular.</p>';
    return;
  }

  // iOS 13+ requiere permiso explícito
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          activarSensor();
        } else {
          document.getElementById('res-pasos').innerHTML =
            '<p class="alerta">❌ Permiso denegado. Ve a Ajustes y permite el acceso al movimiento.</p>';
        }
      })
      .catch(err => {
        document.getElementById('res-pasos').innerHTML =
          '<p class="alerta">❌ Error al solicitar permiso: ' + err + '</p>';
      });
  } else {
    activarSensor();
  }
}

function activarSensor() {
  sensorActivo = true;
  document.getElementById('btn-sensor').textContent = '✅ Sensor Activo – Caminando...';
  document.getElementById('btn-sensor').style.background = '#1a7a3a';
  document.getElementById('res-pasos').innerHTML =
    '<p class="normal">✅ Sensor activado. Lleva el celular en la mano o bolsillo y camina.</p>';

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

  // Detectar pico (paso) con histeresis para evitar doble conteo
  if (fuerza > umbral && ultimaFuerza <= umbral) {
    pasos++;
    localStorage.setItem(claveHoy, pasos);
    actualizarDisplay();
  }
  ultimaFuerza = fuerza;
}

function guardarRutina() {
  if (pasos === 0) {
    document.getElementById('res-pasos').innerHTML =
      '<p class="alerta">⚠️ Aún no tienes pasos registrados hoy.</p>';
    return;
  }

  const rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]');
  const nueva = {
    fecha: hoy.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: hoy.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    pasos: pasos
  };
  rutinas.unshift(nueva);
  // Guardar máximo 15 rutinas
  if (rutinas.length > 15) rutinas.pop();
  localStorage.setItem('rutinas_guardadas', JSON.stringify(rutinas));

  document.getElementById('res-pasos').innerHTML =
    `<p class="normal">✅ Rutina guardada: <strong>${pasos.toLocaleString('es-CO')} pasos</strong> el ${nueva.fecha} a las ${nueva.hora}</p>`;

  mostrarHistorial();
}

function resetearPasos() {
  if (!confirm('¿Iniciar nueva rutina? Los pasos actuales se resetearán (la rutina guardada se mantiene).')) return;
  pasos = 0;
  localStorage.removeItem(claveHoy);

  // Desactivar sensor
  if (sensorActivo) {
    window.removeEventListener('devicemotion', detectarPaso);
    sensorActivo = false;
    document.getElementById('btn-sensor').textContent = '🚶 Activar Sensor de Pasos';
    document.getElementById('btn-sensor').style.background = '';
  }

  actualizarDisplay();
  document.getElementById('res-pasos').innerHTML =
    '<p class="normal">🔄 Nueva rutina iniciada. ¡A moverse!</p>';
}

function mostrarHistorial() {
  const rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]');
  const cont = document.getElementById('historial-rutinas');

  if (rutinas.length === 0) {
    cont.innerHTML = '';
    return;
  }

  let html = '<p class="historial-titulo">📋 Rutinas guardadas</p>';
  rutinas.forEach(r => {
    const pct = Math.min(Math.round((r.pasos / META_PASOS) * 100), 100);
    html += `
      <div class="rutina-item">
        <div>
          <div class="rutina-pasos">👟 ${r.pasos.toLocaleString('es-CO')} pasos</div>
          <div class="rutina-fecha">${r.fecha} · ${r.hora} · ${pct}% meta</div>
        </div>
      </div>`;
  });

  cont.innerHTML = html;
}

// Cargar historial al inicio
mostrarHistorial();

// ===== 4. PDF MEJORADO =====
function generarPDF() {
  const nombreInput = document.getElementById('nombre-reporte').value.trim();
  const nombreArchivo = nombreInput
    ? nombreInput.replace(/\s+/g, '_')
    : 'Reporte_KOAJ_' + hoy.toISOString().slice(0, 10);

  // Llenar contenido del PDF
  document.getElementById('pdf-fecha').textContent =
    hoy.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // IMC
  const imcRes = document.getElementById('res-imc').innerText;
  document.getElementById('pdf-imc').textContent = imcRes || 'No calculado en esta sesión.';

  // Sueño
  const suenoRes = document.getElementById('res-sueno').innerText;
  document.getElementById('pdf-sueno').textContent = suenoRes || 'No calculado en esta sesión.';

  // Pasos
  const pct = Math.min(((pasos / META_PASOS) * 100).toFixed(1), 100);
  document.getElementById('pdf-pasos').textContent =
    `Pasos registrados hoy: ${pasos.toLocaleString('es-CO')} de ${META_PASOS.toLocaleString('es-CO')} (${pct}% de la meta diaria).`;

  // Rutinas guardadas
  const rutinas = JSON.parse(localStorage.getItem('rutinas_guardadas') || '[]');
  if (rutinas.length > 0) {
    let tabla = '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
    tabla += '<tr style="background:#e8f5e9;"><th style="padding:6px; border:1px solid #ccc; text-align:left;">Fecha</th><th style="padding:6px; border:1px solid #ccc;">Hora</th><th style="padding:6px; border:1px solid #ccc;">Pasos</th><th style="padding:6px; border:1px solid #ccc;">% Meta</th></tr>';
    rutinas.forEach(r => {
      const p = Math.min(Math.round((r.pasos / META_PASOS) * 100), 100);
      tabla += `<tr><td style="padding:6px; border:1px solid #eee;">${r.fecha}</td><td style="padding:6px; border:1px solid #eee; text-align:center;">${r.hora}</td><td style="padding:6px; border:1px solid #eee; text-align:center;">${r.pasos.toLocaleString('es-CO')}</td><td style="padding:6px; border:1px solid #eee; text-align:center;">${p}%</td></tr>`;
    });
    tabla += '</table>';
    document.getElementById('pdf-rutinas').innerHTML = tabla;
  } else {
    document.getElementById('pdf-rutinas').textContent = 'No hay rutinas guardadas aún.';
  }

  // Mostrar y generar PDF
  const pdfContent = document.getElementById('pdf-content');
  pdfContent.style.display = 'block';

  const opt = {
    margin: 15,
    filename: nombreArchivo + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(pdfContent).save().then(() => {
    pdfContent.style.display = 'none';
  });
                                                 }
