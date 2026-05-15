(function () {
  const HEADER_ALIASES = {
    no: ["no", "stt", "#", "number", "id"],
    subject: ["subject", "source", "nguon", "nguồn", "mon", "môn", "giao trinh", "giáo trình", "sach", "sách", "tai lieu", "tài liệu"],
    unit: ["unit", "bai", "bài", "lesson", "chuong", "chương", "課", "第"],
    session: ["session", "buoi", "buổi", "section", "part", "phan", "phần"],
    word: ["word", "tu", "từ", "tu vung", "từ vựng", "kanji", "vocabulary", "japanese", "tieng nhat", "tiếng nhật", "単語", "語彙", "言葉", "日本語"],
    reading: ["reading", "cach doc", "cách đọc", "phien am", "phiên âm", "kana", "hiragana", "yomikata", "読み方", "よみかた", "ふりがな"],
    meaning: ["meaning", "nghia", "nghĩa", "y nghia", "ý nghĩa", "vietnamese", "translation", "dich", "dịch", "意味", "ベトナム語"],
    example: ["example", "vi du", "ví dụ", "sentence", "cau vi du", "câu ví dụ", "例文", "例"],
    note: ["note", "ghi chu", "ghi chú", "notes", "備考", "メモ"]
  };

  function normalizeText(value) {
    return String(value ?? "").trim();
  }

  function repairMojibake(value) {
    const text = normalizeText(value);
    if (!/[ÃÂÄÅÆÇÑãâăĂ]/.test(text)) return text;
    try {
      return decodeURIComponent(escape(text));
    } catch (error) {
      return text;
    }
  }

  function searchText(value) {
    return normalizeText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeHeader(value) {
    return searchText(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function keyForHeader(header) {
    const normalized = normalizeHeader(header);
    if (!normalized) return null;

    return Object.keys(HEADER_ALIASES).find((key) => {
      return HEADER_ALIASES[key].some((alias) => {
        const cleanAlias = normalizeHeader(alias);
        if (normalized === cleanAlias) return true;
        if (cleanAlias.length <= 2 || normalized.length <= 2) return false;
        return normalized.includes(cleanAlias) || cleanAlias.includes(normalized);
      });
    }) || null;
  }

  function makeId(word, index) {
    const stable = [word.sheet, word.subject, word.unit, word.session, word.word, word.reading, word.meaning]
      .map(searchText)
      .join("|");
    return stable || `word-${index}`;
  }

  function cleanWord(raw, index) {
    const word = {
      no: repairMojibake(raw.no || raw.No || raw.STT || index + 1),
      subject: repairMojibake(raw.subject),
      unit: repairMojibake(raw.unit),
      session: repairMojibake(raw.session),
      word: repairMojibake(raw.word),
      reading: repairMojibake(raw.reading),
      meaning: repairMojibake(raw.meaning),
      example: repairMojibake(raw.example),
      note: repairMojibake(raw.note),
      sheet: repairMojibake(raw.sheet)
    };

    word.id = makeId(word, index);
    return word;
  }

  function cleanWords(rows) {
    return rows
      .map(cleanWord)
      .filter((word) => word.word || word.reading || word.meaning);
  }

  function uniqueValues(words, key) {
    return [...new Set(words.map((word) => word[key]).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), "vi", { numeric: true }));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function toRomaji(input) {
    const text = normalizeText(input);
    if (!text) return "";
    if (/^[a-zA-Z0-9\s\-']+$/.test(text)) return text.toLowerCase();

    const digraphMap = {
      きゃ: "kya", きゅ: "kyu", きょ: "kyo",
      しゃ: "sha", しゅ: "shu", しょ: "sho",
      ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
      にゃ: "nya", にゅ: "nyu", にょ: "nyo",
      ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
      みゃ: "mya", みゅ: "myu", みょ: "myo",
      りゃ: "rya", りゅ: "ryu", りょ: "ryo",
      ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
      じゃ: "ja", じゅ: "ju", じょ: "jo",
      びゃ: "bya", びゅ: "byu", びょ: "byo",
      ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
      う゛ぁ: "va", う゛ぃ: "vi", う゛: "vu", う゛ぇ: "ve", う゛ぉ: "vo"
    };
    const monoMap = {
      あ: "a", い: "i", う: "u", え: "e", お: "o",
      か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
      さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
      た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
      な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
      は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
      ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
      や: "ya", ゆ: "yu", よ: "yo",
      ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
      わ: "wa", を: "o", ん: "n",
      が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
      ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
      だ: "da", で: "de", ど: "do",
      ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
      ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
      ゃ: "ya", ゅ: "yu", ょ: "yo",
      ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
      ゔ: "vu",
      "ー": "-"
    };

    const kana = text
      .replace(/[\u30A1-\u30F6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .replace(/[\u30FC]/g, "ー");

    let result = "";
    for (let i = 0; i < kana.length; i += 1) {
      const pair = kana.slice(i, i + 2);
      if (pair in digraphMap) {
        result += digraphMap[pair];
        i += 1;
        continue;
      }

      const ch = kana[i];
      if (ch === "っ") {
        const nextPair = kana.slice(i + 1, i + 3);
        const next = digraphMap[nextPair] || monoMap[kana[i + 1]] || "";
        result += next ? next[0] : "";
        continue;
      }

      if (ch === "ー") {
        const last = result[result.length - 1];
        if (last && /[aeiou]$/.test(last)) result += last;
        continue;
      }

      result += monoMap[ch] || ch;
    }

    return result.replace(/\s+/g, " ").trim();
  }

  window.VocabularyService = {
    HEADER_ALIASES,
    keyForHeader,
    normalizeText,
    searchText,
    cleanWords,
    uniqueValues,
    escapeHtml,
    shuffle,
    toRomaji
  };
})();
