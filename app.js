// KOAJ - SCRIPT

// Fecha
var hoy = new Date();
document.getElementById('fecha-hoy').innerText = hoy.toLocaleDateString('es-CO', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ---- 1. IMC ----
function calcularIMC() {
  var peso = parseFloat(document.getElementById('peso').value);
  var altura = parseFloat(document.getElementById('altura').value);
  var res = document.getElementById('res-imc');

  if (!peso || !altura) {
    res.innerHTML = '<p style="color:red">Ingresa peso y altura</p>';
    return;
  }

  var imc = (peso / (altura * altura)).toFixed(1);
  var msg = '';

  if (imc < 18.5) {
    msg = 'IMC: ' + imc + ' - Bajo peso. Come mas proteinas y grasas saludables.';
  } else if (imc <= 24.9) {
    msg = 'IMC: ' + imc + ' - Peso normal. Estas en el rango ideal OMS.';
  } else if (imc <= 29.9) {
    msg = 'IMC: ' + imc + ' - Sobrepeso. Aumenta el cardio y mejora tu dieta.';
  } else {
    msg = 'IMC: ' + imc + ' - Obesidad. Consulta a un medico y comienza con caminatas diarias.';
  }

  res.innerHTML = '<p>' + msg + '</p>';
}

// ---- 2. SUENO ----
function calcularDescanso() {
  var horas = parseFloat(document.getElementById('horasSueno').value);
  var res = document.getElementById('res-sueno');

  if (!horas) {
    res.innerHTML = '<p style="color:red">Ingresa las horas dormidas</p>';
    return;
  }

  var msg = '';
  if (horas < 5) {
    msg = 'Dormiste ' + horas + 'h. Alerta: cuerpo agotado. Solo estiramientos hoy.';
  } else if (horas < 6) {
    msg = 'Dormiste ' + horas + 'h. Descansa mas. Caminata suave 20 min maximo.';
  } else if (horas <= 8) {
    msg = 'Dormiste ' + horas + 'h. Buen descanso. Puedes caminar 30-45 min o trote suave.';
  } else {
    msg = 'Dormiste ' + horas + 'h. Optimo! Entrena fuerte: HIIT, pesas o calistenia.';
  }

  res.innerHTML = '<p>' + msg + '</p>';
}

// ---- 3. PODOMETRO ----
var META = 10000;
var pasos = 0;
var sensorActivo = false;
var ultimaFuerza = 0;
var claveHoy = 'pasos_' + hoy.toISOString().slice(0, 10);

try { pasos = parseInt(localStorage.getItem(claveHoy)) || 0; } catch(e) {}
actualizarPasos();

function actualizarPasos() {
  document.getElementById('contador-pasos').innerText = pasos;
  var pct = Math.min(Math.round((pasos / META) * 100), 100);
  document.getElementById('barra-fill').style.width = pct + '%';
  document.getElementById('pct-meta').innerText = pct + '% de tu meta (' + META + ' pasos)';
}

function iniciarPodometro() {
  if (sensorActivo) {
    alert('El sensor ya esta activo. Sigue caminando.');
    return;
  }
  if (!window.DeviceMotionEvent) {
    alert('Este dispositivo no tiene sensor de movimiento.');
    return;
  }
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(function(r) {
      if (r === 'granted') activarSensor();
      else alert('Permiso denegado. Activalo en Ajustes del celular.');
    });
  } else {
    activarSensor();
  }
}

function activarSensor() {
  sensorActivo = true;
  document.getElementById('btn-sensor').innerText = 'Sensor activo - Caminando...';
  document.getElementById('btn-sensor').style.background = '#1a7a3a';
  window.addEventListener('devicemotion', contarPaso);
  alert('Sensor activado. Lleva el celular en la mano o bolsillo y camina.');
}

function contarPaso(e) {
  var acc = e.accelerationIncludingGravity;
  if (!acc) return;
  var f = Math.sqrt((acc.x||0)*(acc.x||0) + (acc.y||0)*(acc.y||0) + (acc.z||0)*(acc.z||0));
  if (f > 12 && ultimaFuerza <= 12) {
    pasos++;
    try { localStorage.setItem(claveHoy, pasos); } catch(e) {}
    actualizarPasos();
  }
  ultimaFuerza = f;
}

function guardarRutina() {
  if (pasos === 0) { alert('No tienes pasos registrados aun.'); return; }
  var rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas') || '[]'); } catch(e) {}
  rutinas.unshift({
    fecha: hoy.toLocaleDateString('es-CO'),
    hora: hoy.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}),
    pasos: pasos
  });
  if (rutinas.length > 15) rutinas.pop();
  try { localStorage.setItem('rutinas', JSON.stringify(rutinas)); } catch(e) {}
  alert('Rutina guardada: ' + pasos + ' pasos');
  mostrarHistorial();
}

function resetearPasos() {
  if (!confirm('Resetear pasos e iniciar nueva rutina?')) return;
  pasos = 0;
  try { localStorage.removeItem(claveHoy); } catch(e) {}
  if (sensorActivo) {
    window.removeEventListener('devicemotion', contarPaso);
    sensorActivo = false;
    document.getElementById('btn-sensor').innerText = 'Activar Sensor de Pasos';
    document.getElementById('btn-sensor').style.background = '';
  }
  actualizarPasos();
}

function mostrarHistorial() {
  var rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas') || '[]'); } catch(e) {}
  var cont = document.getElementById('historial-rutinas');
  if (!rutinas.length) { cont.innerHTML = ''; return; }
  var html = '<p class="historial-titulo">Rutinas guardadas</p>';
  rutinas.forEach(function(r) {
    var pct = Math.min(Math.round((r.pasos / META) * 100), 100);
    html += '<div class="rutina-item"><div class="rutina-pasos">👟 ' + r.pasos + ' pasos</div><div class="rutina-fecha">' + r.fecha + ' · ' + r.hora + ' · ' + pct + '% meta</div></div>';
  });
  cont.innerHTML = html;
}

mostrarHistorial();

// ---- 4. PDF ----
function generarPDF() {
  var nombre = document.getElementById('nombre-reporte').value.trim();
  var archivo = nombre ? nombre.replace(/\s+/g,'_') : 'Reporte_KOAJ_' + hoy.toISOString().slice(0,10);
  var fecha = hoy.toLocaleDateString('es-CO', {weekday:'long', year:'numeric', month:'long', day:'numeric'});

  var imc = document.getElementById('res-imc').innerText || 'No calculado. Usa la seccion 1 primero.';
  var sueno = document.getElementById('res-sueno').innerText || 'No calculado. Usa la seccion 2 primero.';
  var pasosTexto = document.getElementById('contador-pasos').innerText || '0';
  var pctTexto = document.getElementById('pct-meta').innerText || '0%';

  var rutinas = [];
  try { rutinas = JSON.parse(localStorage.getItem('rutinas') || '[]'); } catch(e) {}

  var filas = '';
  if (rutinas.length) {
    rutinas.forEach(function(r) {
      var p = Math.min(Math.round((r.pasos/META)*100),100);
      filas += '<tr><td style="padding:6px;border:1px solid #ddd">' + r.fecha + '</td><td style="padding:6px;border:1px solid #ddd;text-align:center">' + r.hora + '</td><td style="padding:6px;border:1px solid #ddd;text-align:center">' + r.pasos + '</td><td style="padding:6px;border:1px solid #ddd;text-align:center">' + p + '%</td></tr>';
    });
  } else {
    filas = '<tr><td colspan="4" style="padding:8px;text-align:center;color:#999">Sin rutinas guardadas aun.</td></tr>';
  }

  var contenido = '<div style="font-family:Arial,sans-serif;padding:30px;color:#111">'
    + '<h1 style="color:#1a7a3a;text-align:center">KOAJ - Reporte de Rendimiento</h1>'
    + '<p style="text-align:center;color:#888">' + fecha + '</p>'
    + (nombre ? '<p style="text-align:center;color:#1a7a3a;font-weight:bold">' + nombre + '</p>' : '')
    + '<hr style="border:2px solid #2ecc71;margin:20px 0">'
    + '<h3 style="color:#1a7a3a">📊 IMC - Salud</h3><p>' + imc + '</p>'
    + '<h3 style="color:#1a7a3a">🌙 Plan segun Sueno</h3><p>' + sueno + '</p>'
    + '<h3 style="color:#1a7a3a">🚶 Actividad del Dia</h3>'
    + '<p>Pasos: <strong>' + pasosTexto + '</strong> &nbsp;|&nbsp; ' + pctTexto + '</p>'
    + '<h3 style="color:#1a7a3a">💾 Historial de Rutinas</h3>'
    + '<table style="width:100%;border-collapse:collapse;font-size:13px">'
    + '<tr style="background:#2ecc71"><th style="padding:8px;border:1px solid #ddd">Fecha</th><th style="padding:8px;border:1px solid #ddd">Hora</th><th style="padding:8px;border:1px solid #ddd">Pasos</th><th style="padding:8px;border:1px solid #ddd">% Meta</th></tr>'
    + filas + '</table>'
    + '<hr style="margin:20px 0"><p style="text-align:center;color:#1a7a3a;font-weight:bold">Sigue adelante! Cada paso es fuerza vital. KOAJ App</p>'
    + '</div>';

  var el = document.createElement('div');
  el.innerHTML = contenido;
  el.style.cssText = 'position:fixed;left:-9999px;top:0;width:750px;background:#fff;';
  document.body.appendChild(el);

  html2pdf().set({
    margin: 10,
    filename: archivo + '.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(el).save().then(function() {
    document.body.removeChild(el);
  });
      }
      
