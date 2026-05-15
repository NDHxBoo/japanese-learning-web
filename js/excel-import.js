(function () {
  function meaningfulCells(row) {
    return row.map((cell) => VocabularyService.normalizeText(cell)).filter(Boolean);
  }

  function hasJapanese(value) {
    return /[\u3040-\u30ff\u3400-\u9fff]/.test(value);
  }

  function hasKana(value) {
    return /[\u3040-\u30ff]/.test(value);
  }

  function profileColumns(rows) {
    if (!rows.length) return [];
    const maxCols = Math.max(...rows.map((r) => r.length));
    const scores = [];

    for (let c = 0; c < maxCols; c += 1) {
      let kanaCount = 0;
      let kanjiCount = 0;
      let vietnameseCount = 0;
      let numberCount = 0;

      for (let r = 0; r < rows.length; r += 1) {
        const cell = VocabularyService.normalizeText(rows[r][c]);
        if (!cell) continue;

        const hasJp = hasJapanese(cell);
        const hasKan = hasKana(cell);
        const hasKanj = /[\u3400-\u9fff]/.test(cell);

        if (/^\d+(\.\d+)?$/.test(cell)) {
          numberCount += 1;
        } else if (hasKanj) {
          kanjiCount += 1;
        } else if (hasKan && !hasKanj) {
          kanaCount += 1;
        } else if (!hasJp) {
          vietnameseCount += 1;
        }
      }

      scores.push({ index: c, kanaCount, kanjiCount, vietnameseCount, numberCount });
    }

    let wordCol = -1, readingCol = -1, meaningCol = -1, noCol = -1, exampleCol = -1, noteCol = -1;

    const sortedByVi = [...scores].sort((a, b) => b.vietnameseCount - a.vietnameseCount);
    if (sortedByVi[0] && sortedByVi[0].vietnameseCount > 0) meaningCol = sortedByVi[0].index;

    const availableForJp = scores.filter((c) => c.index !== meaningCol);
    const sortedByKanji = [...availableForJp].sort((a, b) => b.kanjiCount - a.kanjiCount);
    if (sortedByKanji[0] && sortedByKanji[0].kanjiCount > 0) {
      wordCol = sortedByKanji[0].index;
    } else {
      const sortedByKanaForWord = [...availableForJp].sort((a, b) => b.kanaCount - a.kanaCount);
      if (sortedByKanaForWord[0] && sortedByKanaForWord[0].kanaCount > 0) wordCol = sortedByKanaForWord[0].index;
    }

    const availableForReading = scores.filter((c) => c.index !== meaningCol && c.index !== wordCol);
    const sortedByKana = [...availableForReading].sort((a, b) => b.kanaCount - a.kanaCount);
    if (sortedByKana[0] && sortedByKana[0].kanaCount > 0) readingCol = sortedByKana[0].index;

    const availableForNo = scores.filter((c) => c.index !== meaningCol && c.index !== wordCol && c.index !== readingCol);
    const sortedByNo = [...availableForNo].sort((a, b) => b.numberCount - a.numberCount);
    if (sortedByNo[0] && sortedByNo[0].numberCount > 0) noCol = sortedByNo[0].index;

    const unassigned = scores.filter((c) => ![wordCol, readingCol, meaningCol, noCol].includes(c.index) && c.vietnameseCount > 0).sort((a, b) => a.index - b.index);
    if (unassigned[0]) exampleCol = unassigned[0].index;
    if (unassigned[1]) noteCol = unassigned[1].index;

    return rows.map((row) => ({
      no: noCol !== -1 ? row[noCol] : "",
      word: wordCol !== -1 ? row[wordCol] : "",
      reading: readingCol !== -1 ? row[readingCol] : "",
      meaning: meaningCol !== -1 ? row[meaningCol] : "",
      example: exampleCol !== -1 ? row[exampleCol] : "",
      note: noteCol !== -1 ? row[noteCol] : ""
    }));
  }

  function rowsFromWorksheet(sheet) {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const rows = matrix.filter((row) => meaningfulCells(row).length);
    const headerIndex = rows.findIndex((row) => row.some((cell) => VocabularyService.keyForHeader(cell)));
    if (headerIndex === -1) {
      return profileColumns(rows);
    }

    const headers = rows[headerIndex].map((cell, index) => VocabularyService.keyForHeader(cell) || `extra_${index}`);
    return rows.slice(headerIndex + 1).map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        if (!header.startsWith("extra_")) {
          item[header] = row[index];
        }
      });
      return item;
    });
  }

  function readWorkbook(file) {
    return new Promise((resolve, reject) => {
      if (!window.XLSX) {
        reject(new Error("SheetJS chưa được tải. Hãy mở bằng Live Server và kiểm tra kết nối internet."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheets = workbook.SheetNames.map((sheetName) => {
            const rows = rowsFromWorksheet(workbook.Sheets[sheetName]);
            const words = VocabularyService.cleanWords(rows).map((word) => ({
              ...word,
              sheet: sheetName,
              id: `${sheetName}|${word.id}`
            }));
            return { name: sheetName, words };
          }).filter((sheetItem) => sheetItem.words.length);

          resolve({
            sheets,
            words: sheets.flatMap((sheetItem) => sheetItem.words)
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error || new Error("Không đọc được file."));
      reader.readAsArrayBuffer(file);
    });
  }

  window.ExcelImport = {
    readWorkbook
  };
})();
