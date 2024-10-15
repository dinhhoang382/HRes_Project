export const removeAccents = (text: string) => {
  return text
    .normalize('NFD') // Chuẩn hóa Unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu
    .replace(/đ/g, 'd') // Thay thế ký tự 'đ'
    .replace(/Đ/g, 'D'); // Thay thế ký tự 'Đ'
};


