// Cargar fecha
document.getElementById('fecha-hoy').innerText = new Date().toLocaleDateString();

// 1. Lógica IMC (Estándar OMS)
function calcularIMC() {
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;
    const res = document.getElementById('res-imc');
    
    if(peso && altura) {
        const imc = (peso / (altura * altura)).toFixed(1);
        let msg = "";
        let clase = "";

        if (imc < 18.5) {
            msg = `Tu IMC es ${imc} (Bajo peso). Según la OMS, el rango ideal es 18.5 - 24.9. ¡Aumenta tu ingesta calórica saludable!`;
            clase = "alerta";
        } else if (imc >= 18.5 && imc <= 24.9) {
            msg = `Tu IMC es ${imc} (Peso Normal). ¡Excelente! Estás en el rango recomendado por la OMS.`;
            clase = "normal";
        } else {
            msg = `Tu IMC es ${imc} (Sobrepeso/Obesidad). La OMS recomienda mantenerlo bajo 25 para evitar riesgos cardíacos.`;
            clase = "alerta";
        }
        res.innerHTML = `<p class="${clase}">${msg}</p>`;
    }
}

// 2. Lógica Sueño
function calcularDescanso() {
    const horas = document.getElementById('horasSueno').value;
    const res = document.getElementById('res-sueno');
    if (horas < 6) {
        res.innerHTML = "⚠️ <b>Alerta:</b> Dormiste poco. Tu sistema nervioso está agotado. Recomendación: Solo estiramientos o yoga. No levantes pesas hoy.";
    } else if (horas >= 6 && horas <= 8) {
        res.innerHTML = "✅ <b>Buen descanso:</b> Puedes hacer ejercicio de intensidad moderada (Caminar por Kennedy o trote suave).";
    } else {
        res.innerHTML = "🔥 <b>Óptimo:</b> Estás al 100%. Recomendación: Entrenamiento de alta intensidad o calistenia en el parque.";
    }
}

// 3. Pasos (Simple)
let pasos = localStorage.getItem('pasos') || 0;
document.getElementById('contador-pasos').innerText = pasos;

function iniciarPodometro() {
    alert("Sensor activado. Mueve el celular para probar.");
    window.addEventListener('devicemotion', (event) => {
        let acc = event.accelerationIncludingGravity;
        let fuerza = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        if (fuerza > 12) {
            pasos++;
            document.getElementById('contador-pasos').innerText = pasos;
            localStorage.setItem('pasos', pasos);
        }
    });
}

// 4. Generar PDF cada 15 días
function generarPDF() {
    const element = document.getElementById('app-content');
    const opt = {
        margin: 10,
        filename: 'Reporte_BogotaVerde.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
