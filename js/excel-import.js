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

  function scoreCandidate(item) {
    let score = 0;
    if (item.word) score += 2;
    if (item.reading) score += 2;
    if (item.meaning) score += 2;
    if (hasJapanese(item.word)) score += 4;
    if (hasKana(item.reading)) score += 4;
    if (item.meaning && !hasJapanese(item.meaning)) score += 2;
    if (item.no && /^\d+(\.\d+)?$/.test(item.no)) score += 1;
    return score;
  }

  function objectFromPosition(row) {
    const cells = row.map((cell) => VocabularyService.normalizeText(cell));
    if (meaningfulCells(row).length < 2) return null;

    const candidates = [];

    if (cells.length >= 7) {
      candidates.push({
        no: cells[0],
        subject: cells[1],
        unit: cells[2],
        session: cells[3],
        word: cells[4],
        reading: cells[5],
        meaning: cells[6],
        example: cells[7],
        note: cells[8]
      });
    }

    if (cells.length >= 6) {
      candidates.push({
        no: cells[0],
        subject: cells[1],
        unit: cells[2],
        word: cells[3],
        reading: cells[4],
        meaning: cells[5],
        example: cells[6],
        note: cells[7]
      });
    }

    if (cells.length >= 5) {
      candidates.push({
        no: cells[0],
        unit: cells[1],
        word: cells[2],
        reading: cells[3],
        meaning: cells[4],
        example: cells[5],
        note: cells[6]
      });
      candidates.push({
        word: cells[0],
        reading: cells[1],
        meaning: cells[2],
        example: cells[3],
        note: cells[4]
      });
    }

    if (cells.length >= 4) {
      candidates.push({
        no: cells[0],
        word: cells[1],
        reading: cells[2],
        meaning: cells[3],
        example: cells[4],
        note: cells[5]
      });
      candidates.push({
        word: cells[0],
        reading: cells[1],
        meaning: cells[2],
        example: cells[3]
      });
    }

    candidates.push({
      word: cells[0],
      reading: cells[1],
      meaning: cells[2]
    });

    return candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a))[0];
  }

  function rowsFromWorksheet(sheet) {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const rows = matrix.filter((row) => meaningfulCells(row).length);
    const headerIndex = rows.findIndex((row) => row.some((cell) => VocabularyService.keyForHeader(cell)));
    if (headerIndex === -1) {
      return rows.map(objectFromPosition).filter(Boolean);
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
