(function() {
  const els = {
    modal: document.querySelector("#aiQuizModal"),
    closeBtn: document.querySelector("#aiQuizCloseBtn"),
    progressInfo: document.querySelector("#aiQuizProgressInfo"),
    progressBar: document.querySelector("#aiQuizProgressBar span"),
    question: document.querySelector("#aiQuizQuestion"),
    options: document.querySelector("#aiQuizOptions"),
    feedback: document.querySelector("#aiQuizFeedback"),
    nextBtn: document.querySelector("#aiQuizNextBtn"),
    summary: document.querySelector("#aiQuizSummary")
  };

  let quizData = [];
  let currentIndex = 0;
  let correctCount = 0;
  let hasAnswered = false;

  function init() {
    if (!els.modal) return;
    els.closeBtn.addEventListener("click", close);
    els.nextBtn.addEventListener("click", nextQuestion);
  }

  function start(data) {
    if (!data || !data.length) return;
    quizData = data;
    currentIndex = 0;
    correctCount = 0;
    
    els.summary.style.display = "none";
    els.question.parentElement.style.display = "block";
    els.modal.classList.add("open");
    
    renderQuestion();
  }

  function close() {
    els.modal.classList.remove("open");
  }

  function renderQuestion() {
    hasAnswered = false;
    const currentQ = quizData[currentIndex];
    
    els.progressInfo.textContent = `Câu ${currentIndex + 1} / ${quizData.length}`;
    els.progressBar.style.width = `${((currentIndex) / quizData.length) * 100}%`;
    
    els.question.textContent = currentQ.question;
    els.feedback.textContent = "";
    els.nextBtn.style.display = "none";
    
    els.options.innerHTML = currentQ.options.map((opt, i) => `
      <button class="option-button" data-index="${i}">${VocabularyService.escapeHtml(opt)}</button>
    `).join("");

    els.options.querySelectorAll(".option-button").forEach(btn => {
      btn.addEventListener("click", () => chooseOption(parseInt(btn.dataset.index), btn));
    });
  }

  function chooseOption(selectedIndex, btnEl) {
    if (hasAnswered) return;
    hasAnswered = true;
    
    const currentQ = quizData[currentIndex];
    const isCorrect = selectedIndex === currentQ.correctIndex;
    
    if (isCorrect) {
      correctCount++;
      btnEl.classList.add("correct");
      els.feedback.innerHTML = `<span style="color:var(--success-dark)">Chính xác!</span> ${VocabularyService.escapeHtml(currentQ.explanation || "")}`;
    } else {
      btnEl.classList.add("wrong");
      els.options.children[currentQ.correctIndex].classList.add("correct");
      els.feedback.innerHTML = `<span style="color:var(--error-dark)">Sai rồi.</span> ${VocabularyService.escapeHtml(currentQ.explanation || "")}`;
    }
    
    els.nextBtn.style.display = "inline-flex";
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quizData.length) {
      showSummary();
    } else {
      renderQuestion();
    }
  }

  function showSummary() {
    els.progressBar.style.width = "100%";
    els.question.parentElement.style.display = "none";
    els.summary.style.display = "flex";
    
    els.summary.innerHTML = `
      <h3>Hoàn thành bài Quiz AI!</h3>
      <div class="stat-card" style="margin: 20px 0;">
        <span>Điểm của bạn</span>
        <strong>${correctCount} / ${quizData.length}</strong>
      </div>
      <button id="aiQuizReplayBtn" class="button">Làm lại</button>
    `;
    
    document.getElementById("aiQuizReplayBtn").addEventListener("click", () => {
      start(quizData);
    });
  }

  window.AiQuizPlayer = { init, start };
})();
