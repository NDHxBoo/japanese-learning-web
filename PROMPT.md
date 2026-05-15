# Prompt yêu cầu AI code project

Bạn là senior frontend developer.

Hãy xây dựng một website học từ vựng tiếng Nhật dựa trên các file:
- README.md
- REQUIREMENTS.md
- PROJECT_STRUCTURE.md
- TASKS.md

## Công nghệ bắt buộc

Sử dụng:
- HTML
- CSS
- JavaScript thuần
- SheetJS CDN để đọc file Excel `.xlsx`
- LocalStorage để lưu dữ liệu

Không sử dụng:
- React
- Vue
- Angular
- Backend
- Database server

## Dữ liệu đầu vào

Người dùng sẽ import file Excel `.xlsx` có các cột:

- No.
- 科目
- Unit
- Session
- 言葉
- 読み方
- 意味
- 例文・備考

## Mapping dữ liệu

Khi đọc Excel, hãy chuyển dữ liệu thành dạng:

```js
{
  id: row["No."] || index + 1,
  subject: row["科目"] || "",
  unit: row["Unit"] || "",
  session: row["Session"] || "",
  word: row["言葉"] || "",
  reading: row["読み方"] || "",
  meaning: row["意味"] || "",
  note: row["例文・備考"] || "",
  remembered: false
}