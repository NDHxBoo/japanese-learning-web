(function () {
  const KEYS = {
    importedWords: "japanese-vocabulary.importedWords",
    importedWorkbook: "japanese-vocabulary.importedWorkbook",
    useImported: "japanese-vocabulary.useImported",
    progress: "japanese-vocabulary.progress",
    quiz: "japanese-vocabulary.quiz",
    aiSettings: "japanese-vocabulary.aiSettings",
    filters: "japanese-vocabulary.filters"
  };

  // ⚠️ CẢNH BÁO BẢO MẬT: 
  // Nếu bạn dán API Key vào đây, bất kỳ ai vào web của bạn cũng có thể xem được Key này (bằng cách ấn F12).
  // Chỉ nên làm cách này nếu web của bạn chỉ dùng cá nhân hoặc chia sẻ nội bộ.
  const DEFAULT_API_KEY = ""; 

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("Cannot read LocalStorage key", key, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  window.StorageService = {
    loadImportedWorkbook() {
      const workbook = readJson(KEYS.importedWorkbook, null);
      if (workbook && Array.isArray(workbook.sheets)) return workbook;

      const oldWords = readJson(KEYS.importedWords, []);
      if (oldWords.length) {
        return {
          sheets: [{
            name: "Sheet 1",
            words: oldWords.map((word) => ({ ...word, sheet: word.sheet || "Sheet 1" }))
          }],
          activeSheet: ""
        };
      }

      return { sheets: [], activeSheet: "" };
    },

    saveImportedWorkbook(workbook) {
      writeJson(KEYS.importedWorkbook, workbook);
      localStorage.removeItem(KEYS.importedWords);
      localStorage.setItem(KEYS.useImported, "true");
    },

    clearImportedWords() {
      localStorage.removeItem(KEYS.importedWords);
      localStorage.removeItem(KEYS.importedWorkbook);
      localStorage.setItem(KEYS.useImported, "false");
    },

    shouldUseImported() {
      return localStorage.getItem(KEYS.useImported) === "true";
    },

    loadProgress() {
      return readJson(KEYS.progress, {});
    },

    saveProgress(progress) {
      writeJson(KEYS.progress, progress);
    },

    clearProgress() {
      localStorage.removeItem(KEYS.progress);
      localStorage.removeItem(KEYS.quiz);
    },

    loadQuizStats() {
      return readJson(KEYS.quiz, { correct: 0, total: 0, lastScore: 0, lastTotal: 0 });
    },

    saveQuizStats(stats) {
      writeJson(KEYS.quiz, stats);
    },

    loadAiSettings() {
      const settings = readJson(KEYS.aiSettings, {});
      return {
        apiKey: settings.apiKey || DEFAULT_API_KEY,
        model: settings.model && !settings.model.startsWith("gpt-") ? settings.model : "gemini-2.5-flash"
      };
    },

    saveAiSettings(settings) {
      writeJson(KEYS.aiSettings, {
        apiKey: settings.apiKey || "",
        model: settings.model || "gemini-2.5-flash"
      });
    },

    loadFilters() {
      return readJson(KEYS.filters, {
        search: "",
        sheet: "",
        subject: "",
        unit: "",
        status: "",
        pageSize: 50
      });
    },

    saveFilters(filters) {
      writeJson(KEYS.filters, filters);
    }
  };
})();
