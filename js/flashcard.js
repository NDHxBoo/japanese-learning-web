(function () {
  function createFlashcardController(getState, actions, elements) {
    function currentWord() {
      const state = getState();
      return state.filtered[state.cardIndex] || null;
    }

    function show(delta) {
      const state = getState();
      if (!state.filtered.length) return;
      state.cardIndex = (state.cardIndex + delta + state.filtered.length) % state.filtered.length;
      state.cardFlipped = false;
      actions.render();
    }

    function mark(status) {
      const word = currentWord();
      if (!word) return;
      actions.setWordStatus(word.id, status);
      show(1);
    }

    function flip() {
      const state = getState();
      state.cardFlipped = !state.cardFlipped;
      render();
    }

    function render() {
      const state = getState();
      const word = currentWord();
      const romaji = VocabularyService.toRomaji(word?.reading || "");
      elements.flashcard.classList.toggle("flipped", state.cardFlipped);
      elements.cardCounter.textContent = state.filtered.length ? `${state.cardIndex + 1} / ${state.filtered.length}` : "0 / 0";
      elements.cardSideLabel.textContent = state.cardFlipped ? "Mặt sau" : "Mặt trước";

      if (!word) {
        elements.cardWord.textContent = "---";
        elements.cardReading.textContent = "";
        elements.cardMeaning.textContent = "";
        elements.cardMeta.textContent = "";
        elements.cardExtra.textContent = "Vui lòng import file Excel trước khi học.";
        return;
      }

      elements.cardWord.textContent = word.word || "---";
      elements.cardReading.textContent = state.cardFlipped ? `Romaji: ${romaji || "-"}` : "";
      elements.cardMeaning.textContent = state.cardFlipped ? word.meaning || "(chưa có nghĩa)" : "";
      elements.cardMeta.textContent = [word.sheet, word.unit && `Unit ${word.unit}`, word.session && `Session ${word.session}`]
        .filter(Boolean)
        .join(" • ");
      elements.cardExtra.textContent = state.cardFlipped ? [word.reading && `Kana: ${word.reading}`, word.example, word.note].filter(Boolean).join(" | ") : "Mặt trước: Kanji. Lật thẻ để xem nghĩa + romaji.";
    }

    elements.flashcard.addEventListener("click", flip);
    elements.flipCardBtn.addEventListener("click", flip);
    elements.prevCardBtn.addEventListener("click", () => show(-1));
    elements.nextCardBtn.addEventListener("click", () => show(1));
    elements.knownCardBtn.addEventListener("click", () => mark("known"));
    elements.learningCardBtn.addEventListener("click", () => mark("learning"));

    return { render };
  }

  window.createFlashcardController = createFlashcardController;
})();
