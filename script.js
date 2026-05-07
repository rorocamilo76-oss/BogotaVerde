// ===== 4. PDF – OPTIMIZADO =====
function generarPDF() {
  const nombreInput = document.getElementById('nombre-reporte').value.trim();
  const nombreArchivo = nombreInput
    ? nombreInput.replace(/\s+/g, '_')
    : 'Reporte_KOAJ_' + claveHoy;

  const fechaTexto = hoy.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Leer datos de pantalla
  const textoIMC = document.getElementById('res-imc').innerText.trim() ||
    'No calculado. Ingresa tu peso y altura y toca Analizar Salud.';
  const textoSueno = document.getElementById('res-sueno').innerText.trim() ||
    'No calculado. Ingresa tus horas de sueno y toca Ver Plan.';
  const textoContador = document.getElementById('contador-pasos').innerText.trim();
  const textoPct = document.getElementById('pct-meta').innerText.trim();

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

  // Plantilla HTML (Mismos estilos y cajones)
  const contenidoHTML = `
    <div id="pdf-container" style="font-family:Arial,sans-serif;color:#111;padding:40px;width:650px;background:#fff;">
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
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 8px;">Plan segun Sueño</h2>
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
        <h2 style="color:#1a7a3a;font-size:15px;margin:0 0 10px;">Historial de Rutinas (últimos 15 días)</h2>
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

      <p style="text-align:center;color:#1a7a3a;font-weight:bold;font-size:13px;margin-top:30px;">
        ¡Sigue adelante! Cada paso es fuerza vital. KOAJ App
      </p>
    </div>`;

  // Crear elemento temporal
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contenidoHTML;
  
  // IMPORTANTE: Para que no salga en blanco, lo añadimos al body 
  // pero lo ocultamos de la vista del usuario sin usar 'display:none'
  Object.assign(tempDiv.style, {
    position: 'absolute',
    left: '-10000px',
    top: '0',
    width: '650px'
  });
  
  document.body.appendChild(tempDiv);

  const opt = {
    margin: 10,
    filename: nombreArchivo + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 5, // Mayor escala para evitar el blanco
      useCORS: true,
      letterRendering: true,
      scrollY: 0 
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Usamos el método worker para asegurar que el DOM se procese
  html2pdf().set(opt).from(tempDiv).toPdf().get('pdf').save().then(() => {
    document.body.removeChild(tempDiv);
  });
}
  
