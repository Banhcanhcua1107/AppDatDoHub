const fs = require('fs');
// Dòng code mới
const { glob } = require('glob');
const strip = require('strip-comments');

console.log('Bắt đầu quá trình xóa comment...');

// Tìm tất cả các file .js, .jsx, .ts, .tsx trong thư mục src (hoặc thư mục chứa mã nguồn của bạn)
glob('src/**/*.{js,jsx,ts,tsx}', (err, files) => {
  if (err) {
    console.error('Không thể đọc danh sách file:', err);
    return;
  }

  files.forEach((file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(`Không thể đọc file: ${file}`, err);
        return;
      }

      const strippedData = strip(data);

      fs.writeFile(file, strippedData, 'utf8', (err) => {
        if (err) {
          console.error(`Không thể ghi vào file: ${file}`, err);
          return;
        }
        console.log(`Đã xóa comment trong file: ${file}`);
      });
    });
  });
});