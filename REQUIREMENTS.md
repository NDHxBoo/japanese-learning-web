# Requirements

## 1. Dữ liệu đầu vào

Người dùng sẽ cung cấp file Excel `.xlsx`.

File Excel có các cột:

| Cột | Ý nghĩa |
|---|---|
| No. | Số thứ tự |
| 科目 | Tên môn học / giáo trình |
| Unit | Bài học |
| Session | Buổi học |
| 言葉 | Từ vựng tiếng Nhật |
| 読み方 | Cách đọc Hiragana/Katakana |
| 意味 | Nghĩa tiếng Việt |
| 例文・備考 | Ví dụ hoặc ghi chú |

## 2. Object dữ liệu sau khi import

Mỗi dòng Excel được chuyển thành object:

```js
{
  id: 1,
  subject: "Dekiru",
  unit: "1",
  session: "1",
  word: "汗ばむ",
  reading: "あせばむ",
  meaning: "toát mồ hôi",
  note: "例文 hoặc ghi chú"
}