// Intro: iniciar al tocar, y opcional autoinicio suave (por si quieres)
    (function(){
      const intro = document.getElementById('intro-screen');
      const startBtn = document.getElementById('startBtn');

      function startSurvey(){
        if (!intro) return;
        intro.style.display = 'none';
      }

      if (startBtn) startBtn.addEventListener('click', startSurvey);

      // Opcional: autoinicio después de 1200ms (si quieres efecto loader)
      // setTimeout(startSurvey, 1200);
    })();

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
              <input type="radio" name="q${index}" value="${opt}" onchange="enableNext()">
              ${opt}
            </label>
          `).join('')}
        </div>
      `;
      wrapper.appendChild(div);
    });

    function updateUI() {
      document.getElementById('current-step').innerText = currentStep + 1;
      document.getElementById('pb').style.width = ((currentStep + 1) / questions.length * 100) + '%';

      document.querySelectorAll('.question-slide').forEach((slide, index) => {
        slide.classList.toggle('active', index === currentStep);
      });

      document.getElementById('prevBtn').disabled = (currentStep === 0);
      document.getElementById('nextBtn').innerText = (currentStep === questions.length - 1) ? 'Finalizar' : 'Siguiente';

      enableNext();
    }

    function changeStep(n) {
      if (currentStep + n >= questions.length) {
        showFinalScreen();
        return;
      }
      currentStep += n;
      updateUI();
    }

    function enableNext() {
      const currentInputs = document.getElementsByName(`q${currentStep}`);
      const isSelected = Array.from(currentInputs).some(input => input.checked);
      document.getElementById('nextBtn').disabled = !isSelected;
    }

    function showFinalScreen() {
      document.getElementById('survey-content').style.display = 'none';
      document.getElementById('final-screen').style.display = 'flex';

      const params = new URLSearchParams(location.search);
      const extra = Object.fromEntries(params.entries());

      const data = new FormData(document.getElementById('poll-form'));
      for (const [k,v] of Object.entries(extra)) data.append(k, v);

      console.log("Datos listos para enviar:", Object.fromEntries(data));
    }

    updateUI();