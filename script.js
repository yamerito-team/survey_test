/** ==========================
 *  version 0.1 - survey app
 *  ========================== */
const STORAGE_KEY = 'survey_progress_v1';

// Intro: iniciar al tocar, y opcional autoinicio suave (por si quieres)
(function () {
  const intro = document.getElementById('intro-screen');
  const startBtn = document.getElementById('startBtn');

  function hasProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      // Si hay step guardado o cualquier respuesta, lo consideramos progreso
      return (typeof data.step === 'number') || (data.answers && Object.keys(data.answers).length > 0);
    } catch {
      return false;
    }
  }

  function startSurvey() {
    if (!intro) return;
    intro.style.display = 'none';
  }

  if (startBtn) startBtn.addEventListener('click', startSurvey);

  // ✅ Si hay progreso guardado, saltar splash automáticamente
  if (hasProgress()) startSurvey();

  // Opcional: autoinicio después de 1500ms (si quieres efecto loader)
  setTimeout(startSurvey, 1500);
})();

/** ==========================
 *  Persistencia (localStorage)
 *  ========================== */
function saveProgress() {
  const data = {
    step: currentStep,
    answers: {},
    savedAt: Date.now()
  };

  questions.forEach((_, i) => {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    if (checked) data.answers[`q${i}`] = checked.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getLastAnsweredIndex() {
  for (let i = questions.length - 1; i >= 0; i--) {
    if (document.querySelector(`input[name="q${i}"]:checked`)) {
      return i;
    }
  }
  return -1;
}

function restoreProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    if (typeof data.step === 'number') {
      currentStep = Math.min(Math.max(data.step, 0), questions.length - 1);
    }

    if (data.answers && typeof data.answers === 'object') {
      Object.entries(data.answers).forEach(([name, value]) => {
        const input = document.querySelector(
          `input[name="${name}"][value="${value}"]`
        );
        if (input) input.checked = true;
      });
    }

    /* 👇 AQUÍ VA EL AJUSTE LÓGICO DEL STEP */
    const lastAnswered = getLastAnsweredIndex();

    if (lastAnswered >= 0) {
      const expectedStep = Math.min(lastAnswered + 1, questions.length - 1);

      const currentHasAnswer = !!document.querySelector(
        `input[name="q${currentStep}"]:checked`
      );

      if (!currentHasAnswer) {
        currentStep = expectedStep;
      }
    } else {
      currentStep = 0;
    }

  } catch (e) {
    console.warn('Progreso inválido, limpiando storage');
    localStorage.removeItem(STORAGE_KEY);
  }
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

/** ==========================
 *  Encuesta
 *  ========================== */
const questions = [
  "¿Qué tan satisfecho estás con la rapidez del servicio?",
  "¿La interfaz te resultó intuitiva?",
  "¿Recomendarías esta herramienta a un colega?",
  "¿Cómo calificarías la calidad del soporte técnico?",
  "¿El tiempo de carga fue el esperado?",
  "¿Encontraste todas las funciones que buscabas?",
  "¿Qué tan clara fue la documentación proporcionada?",
  "¿Cómo valoras la relación calidad-precio?",
  "¿Qué tan probable es que vuelvas a usar el servicio?",
  "¿En general, cómo calificarías tu experiencia hoy?"
];

const options = ["Excelente", "Muy Bueno", "Bueno", "Regular", "Pobre"];
let currentStep = 0;

const wrapper = document.getElementById('questions-wrapper');

questions.forEach((q, index) => {
  const div = document.createElement('div');
  div.className = `question-slide ${index === 0 ? 'active' : ''}`;
  div.innerHTML = `
    <h2>${q}</h2>
    <div class="options-group">
      ${options.map(opt => `
        <label class="option-label">
          <input type="radio" name="q${index}" value="${opt}"
                 onchange="enableNext(); saveProgress();">
          ${opt}
        </label>
      `).join('')}
    </div>
  `;
  wrapper.appendChild(div);
});

function updateUI() {
  document.getElementById('current-step').innerText = currentStep + 1;
  document.getElementById('pb').style.width =
    ((currentStep + 1) / questions.length * 100) + '%';

  document.querySelectorAll('.question-slide').forEach((slide, index) => {
    slide.classList.toggle('active', index === currentStep);
  });

  document.getElementById('prevBtn').disabled = (currentStep === 0);
  document.getElementById('nextBtn').innerText =
    (currentStep === questions.length - 1) ? 'Finalizar' : 'Siguiente';

  enableNext();
}

// OJO: tu HTML llama changeStep() desde onclick, así que debe quedar global.
// Estas funciones ya quedan globales por estar en el scope principal.
function changeStep(n) {
  if (currentStep + n >= questions.length) {
    showFinalScreen();
    return;
  }

  const next = currentStep + n;
  if (next < 0) return;

  currentStep = next;
  saveProgress();
  updateUI();
}

function enableNext() {
  const currentInputs = document.getElementsByName(`q${currentStep}`);
  const isSelected = Array.from(currentInputs).some(input => input.checked);
  document.getElementById('nextBtn').disabled = !isSelected;
}

function showFinalScreen() {
  // Al terminar, limpiar progreso guardado
  clearProgress();

  document.getElementById('survey-content').style.display = 'none';
  document.getElementById('final-screen').style.display = 'flex';

  const params = new URLSearchParams(location.search);
  const extra = Object.fromEntries(params.entries());

  const data = new FormData(document.getElementById('poll-form'));
  for (const [k, v] of Object.entries(extra)) data.append(k, v);

  console.log("Datos listos para enviar:", Object.fromEntries(data));
}

// Restaurar antes de pintar UI
restoreProgress();
updateUI();
enableNext();

// Exponer funciones usadas inline (por seguridad)
window.changeStep = changeStep;
window.enableNext = enableNext;
window.saveProgress = saveProgress;
