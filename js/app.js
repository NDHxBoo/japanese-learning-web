(function () {
  const els = {
    totalWords: document.querySelector("#totalWords"),
    knownWords: document.querySelector("#knownWords"),
    progressPercent: document.querySelector("#progressPercent"),
    quizAccuracy: document.querySelector("#quizAccuracy"),
    dataSourceLabel: document.querySelector("#dataSourceLabel"),
    excelFile: document.querySelector("#excelFile"),
    sheetFilter: document.querySelector("#sheetFilter"),
    clearImportBtn: document.querySelector("#clearImportBtn"),
    clearProgressBtn: document.querySelector("#clearProgressBtn"),
    importMessage: document.querySelector("#importMessage"),
    searchInput: document.querySelector("#searchInput"),
    subjectFilter: document.querySelector("#subjectFilter"),
    unitFilter: document.querySelector("#unitFilter"),
    sessionFilter: document.querySelector("#sessionFilter"),
    statusFilter: document.querySelector("#statusFilter"),
    resetFiltersBtn: document.querySelector("#resetFiltersBtn"),
    shuffleBtn: document.querySelector("#shuffleBtn"),
    pageSizeSelect: document.querySelector("#pageSizeSelect"),
    prevPageBtn: document.querySelector("#prevPageBtn"),
    nextPageBtn: document.querySelector("#nextPageBtn"),
    pageInfo: document.querySelector("#pageInfo"),
    resultSummary: document.querySelector("#resultSummary"),
    vocabularyTable: document.querySelector("#vocabularyTable"),
    emptyStateTemplate: document.querySelector("#emptyStateTemplate"),
    markFilteredKnownBtn: document.querySelector("#markFilteredKnownBtn"),
    markFilteredLearningBtn: document.querySelector("#markFilteredLearningBtn"),
    cardCounter: document.querySelector("#cardCounter"),
    cardSideLabel: document.querySelector("#cardSideLabel"),
    flashcard: document.querySelector("#flashcard"),
    cardWord: document.querySelector("#cardWord"),
    cardReading: document.querySelector("#cardReading"),
    cardMeaning: document.querySelector("#cardMeaning"),
    cardMeta: document.querySelector("#cardMeta"),
    cardExtra: document.querySelector("#cardExtra"),
    flipCardBtn: document.querySelector("#flipCardBtn"),
    prevCardBtn: document.querySelector("#prevCardBtn"),
    nextCardBtn: document.querySelector("#nextCardBtn"),
    knownCardBtn: document.querySelector("#knownCardBtn"),
    learningCardBtn: document.querySelector("#learningCardBtn"),
    quizSummary: document.querySelector("#quizSummary"),
    quizScore: document.querySelector("#quizScore"),
    quizWord: document.querySelector("#quizWord"),
    quizReading: document.querySelector("#quizReading"),
    quizOptions: document.querySelector("#quizOptions"),
    quizFeedback: document.querySelector("#quizFeedback"),
    newQuizBtn: document.querySelector("#newQuizBtn"),
    nextQuestionBtn: document.querySelector("#nextQuestionBtn"),
    progressKnownCount: document.querySelector("#progressKnownCount"),
    progressLearningCount: document.querySelector("#progressLearningCount"),
    progressQuizStats: document.querySelector("#progressQuizStats"),
    progressKnownBar: document.querySelector("#progressKnownBar"),
    progressLearningBar: document.querySelector("#progressLearningBar"),
    progressQuizBar: document.querySelector("#progressQuizBar"),
    unitProgressList: document.querySelector("#unitProgressList"),
    exportDataBtn: document.querySelector("#exportDataBtn"),
    importDataFile: document.querySelector("#importDataFile"),
    backupMessage: document.querySelector("#backupMessage"),
    aiApiKey: document.querySelector("#aiApiKey"),
    aiModel: document.querySelector("#aiModel"),
    aiMode: document.querySelector("#aiMode"),
    aiPrompt: document.querySelector("#aiPrompt"),
    runAiBtn: document.querySelector("#runAiBtn"),
    saveAiSettingsBtn: document.querySelector("#saveAiSettingsBtn"),
    copyAiResultBtn: document.querySelector("#copyAiResultBtn"),
    aiMessage: document.querySelector("#aiMessage"),
    aiOutput: document.querySelector("#aiOutput"),
    aiLoading: document.querySelector("#aiLoading"),
    aiResultState: document.querySelector("#aiResultState")
  };

  const savedWorkbook = StorageService.loadImportedWorkbook();
  const savedFilters = StorageService.loadFilters();
  const aiSettings = StorageService.loadAiSettings();

  const state = {
    sheets: StorageService.shouldUseImported() ? savedWorkbook.sheets : [],
    activeSheet: savedWorkbook.activeSheet || savedFilters.sheet || "",
    words: StorageService.shouldUseImported() ? savedWorkbook.sheets.flatMap((sheet) => sheet.words) : [],
    filtered: [],
    progress: StorageService.loadProgress(),
    quizStats: StorageService.loadQuizStats(),
    quizSession: { correct: 0, total: 0, answered: 0 },
    quizQuestion: null,
    cardIndex: 0,
    cardFlipped: false,
    currentPage: 1,
    pageSize: Number(savedFilters.pageSize) || 50
  };

  function getState() {
    return state;
  }

  function statusFor(wordId) {
    return state.progress[wordId] || "learning";
  }

  function fillSelect(select, values, label) {
    const current = select.value;
    select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${VocabularyService.escapeHtml(value)}">${VocabularyService.escapeHtml(value)}</option>`).join("")}`;
    select.value = values.includes(current) ? current : "";
  }

  function currentFilters() {
    return {
      search: els.searchInput.value,
      sheet: els.sheetFilter.value,
      subject: els.subjectFilter.value,
      unit: els.unitFilter.value,
      session: els.sessionFilter.value,
      status: els.statusFilter.value,
      pageSize: state.pageSize
    };
  }

  function saveFilters() {
    StorageService.saveFilters(currentFilters());
  }

  function refreshFilterOptions() {
    const currentSubject = els.subjectFilter.value;
    const currentUnit = els.unitFilter.value;
    const currentSession = els.sessionFilter.value;

    const sheetWords = state.words.filter(w => !state.activeSheet || w.sheet === state.activeSheet);
    
    const subjects = VocabularyService.uniqueValues(sheetWords, "subject");
    fillSelect(els.subjectFilter, subjects, "Tất cả nguồn");
    els.subjectFilter.value = subjects.includes(currentSubject) ? currentSubject : "";

    const unitWords = sheetWords.filter(w => !els.subjectFilter.value || w.subject === els.subjectFilter.value);
    const units = VocabularyService.uniqueValues(unitWords, "unit");
    fillSelect(els.unitFilter, units, "Tất cả Unit");
    els.unitFilter.value = units.includes(currentUnit) ? currentUnit : "";

    const sessionWords = unitWords.filter(w => !els.unitFilter.value || w.unit === els.unitFilter.value);
    const sessions = VocabularyService.uniqueValues(sessionWords, "session");
    fillSelect(els.sessionFilter, sessions, "Tất cả Session");
    els.sessionFilter.value = sessions.includes(currentSession) ? currentSession : "";

    fillSelect(els.sheetFilter, state.sheets.map((sheet) => sheet.name), "Tất cả sheet");
    els.sheetFilter.value = state.activeSheet && state.sheets.some((sheet) => sheet.name === state.activeSheet) ? state.activeSheet : "";
  }

  function restoreControls() {
    els.searchInput.value = savedFilters.search || "";
    els.statusFilter.value = savedFilters.status || "";
    els.pageSizeSelect.value = String(state.pageSize);
    if (savedFilters.subject) els.subjectFilter.value = savedFilters.subject;
    if (savedFilters.unit) els.unitFilter.value = savedFilters.unit;
    if (savedFilters.session) els.sessionFilter.value = savedFilters.session;
    if (savedFilters.sheet) els.sheetFilter.value = savedFilters.sheet;
  }

  function setWordStatus(wordId, status) {
    if (status === "known") {
      state.progress[wordId] = "known";
    } else {
      delete state.progress[wordId];
    }
    StorageService.saveProgress(state.progress);
    renderStats();
    renderTable();
    renderProgressByUnit();
  }

  function saveQuizStats() {
    StorageService.saveQuizStats(state.quizStats);
  }

  function applyFilters(resetPage = true) {
    const query = VocabularyService.searchText(els.searchInput.value);
    state.activeSheet = els.sheetFilter.value;
    const subject = els.subjectFilter.value;
    const unit = els.unitFilter.value;
    const session = els.sessionFilter.value;
    const status = els.statusFilter.value;

    state.filtered = state.words.filter((word) => {
      const queryMatch = !query || [word.word, word.reading, word.meaning, word.example, word.note, word.subject, word.unit, word.session, word.sheet]
        .some((value) => VocabularyService.searchText(value).includes(query));
      const sheetMatch = !state.activeSheet || word.sheet === state.activeSheet;
      const subjectMatch = !subject || word.subject === subject;
      const unitMatch = !unit || word.unit === unit;
      const sessionMatch = !session || word.session === session;
      const statusMatch = !status || statusFor(word.id) === status;
      return queryMatch && sheetMatch && subjectMatch && unitMatch && sessionMatch && statusMatch;
    });

    refreshFilterOptions();

    if (resetPage) state.currentPage = 1;
    state.cardIndex = Math.min(state.cardIndex, Math.max(state.filtered.length - 1, 0));
    state.cardFlipped = false;
    saveFilters();
    render();
    quiz.makeQuestion();
  }

  function renderStats() {
    const total = state.words.length;
    const known = state.words.filter((word) => statusFor(word.id) === "known").length;
    const learning = Math.max(total - known, 0);
    const percent = total ? Math.round((known / total) * 100) : 0;
    const lastTotal = state.quizStats.lastTotal || state.quizStats.total || 0;
    const lastScore = state.quizStats.lastScore ?? state.quizStats.correct ?? 0;
    const quizAccuracy = lastTotal ? Math.round((lastScore / lastTotal) * 100) : 0;

    els.totalWords.textContent = total;
    els.knownWords.textContent = known;
    els.progressPercent.textContent = `${percent}%`;
    els.quizAccuracy.textContent = `${quizAccuracy}%`;
    els.progressKnownCount.textContent = known;
    els.progressLearningCount.textContent = learning;
    els.progressQuizStats.textContent = `${lastScore} / ${lastTotal}`;
    els.progressKnownBar.style.width = `${percent}%`;
    els.progressLearningBar.style.width = `${total ? Math.round((learning / total) * 100) : 0}%`;
    els.progressQuizBar.style.width = `${quizAccuracy}%`;
    els.dataSourceLabel.textContent = total ? `${state.sheets.length} sheet, ${total} từ` : "Chưa có dữ liệu";
  }

  function renderTable() {
    const total = state.filtered.length;
    const pageCount = Math.max(Math.ceil(total / state.pageSize), 1);
    state.currentPage = Math.min(Math.max(state.currentPage, 1), pageCount);
    const start = (state.currentPage - 1) * state.pageSize;
    const pageRows = state.filtered.slice(start, start + state.pageSize);

    els.resultSummary.textContent = `${total} kết quả`;
    els.pageInfo.textContent = total ? `Trang ${state.currentPage} / ${pageCount}` : "Trang 0 / 0";
    els.prevPageBtn.disabled = state.currentPage <= 1;
    els.nextPageBtn.disabled = state.currentPage >= pageCount || !total;

    if (!pageRows.length) {
      els.vocabularyTable.innerHTML = els.emptyStateTemplate.innerHTML;
      return;
    }

    els.vocabularyTable.innerHTML = pageRows.map((word, index) => {
      const known = statusFor(word.id) === "known";
      return `<tr>
        <td>${start + index + 1}</td>
        <td class="word-cell">${VocabularyService.escapeHtml(word.word || "-")}</td>
        <td>${VocabularyService.escapeHtml(word.reading || "-")}</td>
        <td>${VocabularyService.escapeHtml(word.meaning || "-")}</td>
        <td class="note-cell">${VocabularyService.escapeHtml([word.example, word.note].filter(Boolean).join(" | ") || "-")}</td>
        <td>${VocabularyService.escapeHtml(word.subject || word.sheet || "-")}</td>
        <td>${VocabularyService.escapeHtml(word.unit || "-")}</td>
        <td>${VocabularyService.escapeHtml(word.session || "-")}</td>
        <td><button class="status-badge ${known ? "known" : ""}" type="button" data-word-id="${VocabularyService.escapeHtml(word.id)}">${known ? "Đã thuộc" : "Chưa học"}</button></td>
      </tr>`;
    }).join("");
  }

  function renderProgressByUnit() {
    const groups = new Map();
    state.words.forEach((word) => {
      const key = `${word.sheet || "Không có sheet"} / ${word.unit || "Không có Unit"}`;
      if (!groups.has(key)) groups.set(key, { total: 0, known: 0 });
      const group = groups.get(key);
      group.total += 1;
      if (statusFor(word.id) === "known") group.known += 1;
    });

    els.unitProgressList.innerHTML = [...groups.entries()].map(([unit, group]) => {
      const percent = group.total ? Math.round((group.known / group.total) * 100) : 0;
      return `<div class="unit-row">
        <strong>${VocabularyService.escapeHtml(unit)}</strong>
        <div class="progress-bar"><span style="width:${percent}%"></span></div>
        <span>${group.known}/${group.total}</span>
      </div>`;
    }).join("") || `<p class="message">Chưa có dữ liệu.</p>`;
  }

  function render() {
    renderStats();
    renderTable();
    flashcards.render();
    quiz.render();
    renderProgressByUnit();
  }

  function replaceWorkbook(workbook, message) {
    state.sheets = workbook.sheets;
    state.activeSheet = workbook.activeSheet || "";
    state.words = state.sheets.flatMap((sheet) => sheet.words);
    state.filtered = [...state.words];
    state.currentPage = 1;
    state.cardIndex = 0;
    state.cardFlipped = false;
    refreshFilterOptions();
    applyFilters();
    els.importMessage.textContent = message;
  }

  function showSection(sectionId) {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionId);
    });
    document.querySelectorAll(".view-section").forEach((section) => {
      section.classList.toggle("active", section.id === sectionId);
    });
  }

  function setAiLoading(isLoading) {
    els.aiLoading.classList.toggle("hidden", !isLoading);
    els.runAiBtn.disabled = isLoading;
  }

  async function runAi() {
    if (!state.filtered.length) {
      els.aiMessage.textContent = "Vui lòng import file Excel trước khi dùng AI.";
      return;
    }

    const apiKey = els.aiApiKey.value.trim();
    const model = els.aiModel.value || "gemini-2.5-flash";
    if (!apiKey) {
      els.aiMessage.textContent = "Vui lòng nhập Gemini API key.";
      return;
    }

    StorageService.saveAiSettings({ apiKey, model });
    els.aiOutput.textContent = "";
    els.aiMessage.textContent = "";
    els.aiResultState.textContent = "Đang xử lý";
    setAiLoading(true);

    try {
      const text = await AiService.runGemini({
        apiKey,
        model,
        mode: els.aiMode.value,
        customPrompt: els.aiPrompt.value,
        words: state.filtered
      });
      els.aiOutput.textContent = text;
      els.aiResultState.textContent = "Đã có kết quả";
    } catch (error) {
      els.aiOutput.textContent = "";
      els.aiMessage.textContent = error.message || "Gemini request thất bại.";
      els.aiResultState.textContent = "Có lỗi";
    } finally {
      setAiLoading(false);
    }
  }

  const flashcards = createFlashcardController(getState, { render, renderFlashcard: () => flashcards.render(), setWordStatus }, els);
  const quiz = createQuizController(getState, { setWordStatus, saveQuizStats, renderStats }, els);

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.section));
  });

  [els.searchInput, els.sheetFilter, els.subjectFilter, els.unitFilter, els.sessionFilter, els.statusFilter].forEach((control) => {
    control.addEventListener("input", () => applyFilters(true));
  });

  els.pageSizeSelect.addEventListener("input", () => {
    state.pageSize = Number(els.pageSizeSelect.value) || 50;
    applyFilters(true);
  });

  els.prevPageBtn.addEventListener("click", () => {
    state.currentPage -= 1;
    renderTable();
  });

  els.nextPageBtn.addEventListener("click", () => {
    state.currentPage += 1;
    renderTable();
  });

  els.resetFiltersBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    els.sheetFilter.value = "";
    els.subjectFilter.value = "";
    els.unitFilter.value = "";
    els.sessionFilter.value = "";
    els.statusFilter.value = "";
    applyFilters(true);
  });

  els.shuffleBtn.addEventListener("click", () => {
    state.filtered = VocabularyService.shuffle(state.filtered);
    state.currentPage = 1;
    state.cardIndex = 0;
    render();
  });

  els.vocabularyTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-word-id]");
    if (!button) return;
    const nextStatus = statusFor(button.dataset.wordId) === "known" ? "learning" : "known";
    setWordStatus(button.dataset.wordId, nextStatus);
  });

  els.markFilteredKnownBtn.addEventListener("click", () => {
    state.filtered.forEach((word) => {
      state.progress[word.id] = "known";
    });
    StorageService.saveProgress(state.progress);
    render();
  });

  els.markFilteredLearningBtn.addEventListener("click", () => {
    state.filtered.forEach((word) => {
      delete state.progress[word.id];
    });
    StorageService.saveProgress(state.progress);
    render();
  });

  els.excelFile.addEventListener("change", async () => {
    const file = els.excelFile.files[0];
    if (!file) return;
    els.importMessage.textContent = "Đang đọc file Excel...";

    try {
      const result = await ExcelImport.readWorkbook(file);
      if (!result.words.length) {
        els.importMessage.textContent = "Không tìm thấy từ vựng trong file. Hãy kiểm tra file có cột từ vựng, cách đọc, nghĩa hoặc ít nhất 2 cột dữ liệu.";
        return;
      }

      const workbook = {
        sheets: result.sheets,
        activeSheet: result.sheets[0]?.name || ""
      };
      StorageService.saveImportedWorkbook(workbook);
      replaceWorkbook(workbook, `Đã nhập ${result.words.length} từ từ ${result.sheets.length} sheet trong ${file.name}.`);
    } catch (error) {
      els.importMessage.textContent = error.message || "Nhập Excel thất bại.";
    } finally {
      els.excelFile.value = "";
    }
  });

  els.clearImportBtn.addEventListener("click", () => {
    StorageService.clearImportedWords();
    replaceWorkbook({ sheets: [], activeSheet: "" }, "Đã xóa dữ liệu đã nhập. Hãy tải file Excel để bắt đầu.");
  });

  els.clearProgressBtn.addEventListener("click", () => {
    StorageService.clearProgress();
    state.progress = {};
    state.quizStats = { correct: 0, total: 0, lastScore: 0, lastTotal: 0 };
    state.quizSession = { correct: 0, total: 0, answered: 0 };
    render();
  });

  els.exportDataBtn.addEventListener("click", () => {
    const data = {
      importedWorkbook: StorageService.loadImportedWorkbook(),
      useImported: StorageService.shouldUseImported(),
      progress: StorageService.loadProgress(),
      quizStats: StorageService.loadQuizStats(),
      filters: StorageService.loadFilters()
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `japanese-learning-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    els.backupMessage.textContent = "Đã tải xuống file sao lưu. Hãy cất giữ cẩn thận.";
  });

  els.importDataFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.importedWorkbook) StorageService.saveImportedWorkbook(data.importedWorkbook);
        if (data.progress) StorageService.saveProgress(data.progress);
        if (data.quizStats) StorageService.saveQuizStats(data.quizStats);
        if (data.filters) StorageService.saveFilters(data.filters);
        
        els.backupMessage.textContent = "Đã khôi phục thành công. Đang tải lại trang...";
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        els.backupMessage.textContent = "File backup không hợp lệ hoặc bị lỗi.";
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  els.saveAiSettingsBtn.addEventListener("click", () => {
    StorageService.saveAiSettings({
      apiKey: els.aiApiKey.value.trim(),
      model: els.aiModel.value || "gemini-2.5-flash"
    });
    els.aiMessage.textContent = "Đã lưu Gemini API key và model trên trình duyệt này.";
  });

  els.runAiBtn.addEventListener("click", runAi);

  els.copyAiResultBtn.addEventListener("click", async () => {
    const text = els.aiOutput.textContent.trim();
    if (!text || text === "Chưa có kết quả.") {
      els.aiMessage.textContent = "Chưa có kết quả để copy.";
      return;
    }
    await navigator.clipboard.writeText(text);
    els.aiMessage.textContent = "Đã copy kết quả AI.";
  });

  els.aiApiKey.value = aiSettings.apiKey || "";
  els.aiModel.value = aiSettings.model || "gemini-2.5-flash";
  refreshFilterOptions();
  restoreControls();
  applyFilters(false);
  showSection("list-section");
})();
