(function () {
  function resultText(data) {
    return data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n") || "Không có kết quả.";
  }

  function wordLines(words) {
    return words.slice(0, 60).map((word, index) => {
      return [
        `${index + 1}.`,
        `Từ vựng: ${word.word || "-"}`,
        `Cách đọc: ${word.reading || "-"}`,
        `Nghĩa: ${word.meaning || "-"}`,
        `Ví dụ/Ghi chú: ${[word.example, word.note].filter(Boolean).join(" | ") || "-"}`,
        `Unit: ${word.unit || "-"}`,
        `Session: ${word.session || "-"}`,
        `Sheet: ${word.sheet || "-"}`
      ].join(" ");
    }).join("\n");
  }

  function modeInstruction(mode) {
    const modes = {
      explain: "Giải thích các từ quan trọng: nghĩa, cách dùng, sắc thái, lỗi dễ nhầm và ví dụ tiếng Nhật kèm nghĩa.",
      examples: "Tạo ví dụ tiếng Nhật tự nhiên cho các từ vựng, kèm cách đọc nếu cần và dịch tiếng Việt.",
      mnemonic: "Tạo mẹo nhớ ngắn gọn, dễ nhớ cho người Việt, không bịa sai nghĩa.",
      quiz: "Tạo quiz trắc nghiệm 10 câu, mỗi câu 4 đáp án, có đáp án đúng và giải thích ngắn.",
      grammar: "Phân tích ngữ pháp hoặc cấu trúc xuất hiện trong ví dụ/từ vựng, giải thích dễ hiểu cho người Việt.",
      reviewPlan: "Tạo kế hoạch ôn tập 7 ngày dựa trên danh sách từ vựng, chia theo mức độ ưu tiên."
    };
    return modes[mode] || modes.explain;
  }

  function buildPrompt({ mode, customPrompt, words }) {
    return [
      "Bạn là trợ lý học tiếng Nhật cho người Việt.",
      "Hãy dựa trên danh sách từ vựng sau để hỗ trợ học.",
      "Trả lời bằng tiếng Việt, dễ hiểu, có ví dụ tiếng Nhật kèm nghĩa.",
      "Nếu dữ liệu thiếu nghĩa hoặc cách đọc, hãy nói rõ.",
      "",
      "Danh sách từ vựng:",
      wordLines(words),
      "",
      "Chế độ:",
      modeInstruction(mode),
      "",
      "Yêu cầu riêng của người học:",
      customPrompt || "(không có)"
    ].join("\n");
  }

  async function runGemini({ apiKey, model, mode, customPrompt, words }) {
    if (!apiKey) {
      throw new Error("Vui lòng nhập Gemini API key.");
    }
    if (!Array.isArray(words) || !words.length) {
      throw new Error("Vui lòng import file Excel trước khi dùng AI.");
    }

    const selectedModel = model || "gemini-2.5-flash";
    const prompt = buildPrompt({ mode, customPrompt, words });
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error("Không đọc được phản hồi từ Gemini.");
    }

    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini request thất bại với mã ${response.status}.`);
    }

    return resultText(data);
  }

  window.AiService = {
    runGemini
  };
})();
