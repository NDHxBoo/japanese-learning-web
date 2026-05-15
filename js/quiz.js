(function () {
  function createQuizController(getState, actions, elements) {
    function eligibleWords() {
      return getState().filtered.filter((word) => word.meaning);
    }

    function resetQuiz() {
      const state = getState();
      state.quizSession = {
        correct: 0,
        total: 0,
        answered: 0
      };
      makeQuestion();
    }

    function makeQuestion() {
      const state = getState();
      const pool = eligibleWords();
      if (pool.length < 4) {
        state.quizQuestion = null;
        render();
        return;
      }

      const answer = VocabularyService.shuffle(pool)[0];
      const distractors = VocabularyService.shuffle(
        pool.filter((word) => word.id !== answer.id && word.meaning)
      ).slice(0, 3);

      state.quizQuestion = {
        answer,
        answered: false,
        selectedId: "",
        options: VocabularyService.shuffle([answer, ...distractors])
      };
      render();
    }

    function choose(optionId) {
      const state = getState();
      const question = state.quizQuestion;
      if (!question || question.answered) return;

      question.answered = true;
      question.selectedId = optionId;
      state.quizSession.total += 1;
      state.quizSession.answered += 1;

      if (optionId === question.answer.id) {
        state.quizSession.correct += 1;
        actions.setWordStatus(question.answer.id, "known");
      }

      state.quizStats.correct = state.quizSession.correct;
      state.quizStats.total = state.quizSession.total;
      state.quizStats.lastScore = state.quizSession.correct;
      state.quizStats.lastTotal = state.quizSession.total;
      actions.saveQuizStats();
      render();
      actions.renderStats();
    }

    function render() {
      const state = getState();
      const question = state.quizQuestion;
      const pool = eligibleWords();
      elements.quizScore.textContent = `Điểm: ${state.quizSession.correct} / ${state.quizSession.total}`;

      if (pool.length < 4) {
        elements.quizSummary.textContent = "Cần ít nhất 4 từ có nghĩa để tạo quiz.";
        elements.quizWord.textContent = "---";
        elements.quizReading.textContent = "";
        elements.quizOptions.innerHTML = "";
        elements.quizFeedback.textContent = "Hãy import thêm dữ liệu hoặc bỏ bớt bộ lọc.";
        return;
      }

      if (!question) {
        elements.quizSummary.textContent = "Bấm Tạo quiz mới để bắt đầu.";
        elements.quizWord.textContent = "---";
        elements.quizReading.textContent = "";
        elements.quizOptions.innerHTML = "";
        elements.quizFeedback.textContent = "";
        return;
      }

      elements.quizSummary.textContent = `Đang luyện với ${pool.length} từ trong bộ lọc.`;
      elements.quizWord.textContent = question.answer.word || "---";
      elements.quizReading.textContent = "Chọn nghĩa + romaji đúng";
      elements.quizOptions.innerHTML = question.options.map((option) => {
        const classes = ["option-button"];
        if (question.answered && option.id === question.answer.id) classes.push("correct");
        if (question.answered && option.id === question.selectedId && option.id !== question.answer.id) classes.push("wrong");
        const romaji = VocabularyService.toRomaji(option.reading || "");
        const optionText = `${option.meaning || "(chưa có nghĩa)"}${romaji ? ` • ${romaji}` : ""}`;
        return `<button class="${classes.join(" ")}" type="button" data-option-id="${VocabularyService.escapeHtml(option.id)}" ${question.answered ? "disabled" : ""}>${VocabularyService.escapeHtml(optionText)}</button>`;
      }).join("");

      if (!question.answered) {
        elements.quizFeedback.textContent = "Chọn một đáp án.";
      } else if (question.selectedId === question.answer.id) {
        elements.quizFeedback.textContent = "Đúng. Từ này đã được đánh dấu đã thuộc.";
      } else {
        const answerRomaji = VocabularyService.toRomaji(question.answer.reading || "");
        elements.quizFeedback.textContent = `Sai. Đáp án đúng: ${question.answer.meaning}${answerRomaji ? ` • ${answerRomaji}` : ""}`;
      }
    }

    elements.quizOptions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-option-id]");
      if (button) choose(button.dataset.optionId);
    });
    elements.nextQuestionBtn.addEventListener("click", makeQuestion);
    elements.newQuizBtn.addEventListener("click", resetQuiz);

    return { makeQuestion, resetQuiz, render };
  }

  window.createQuizController = createQuizController;
})();
