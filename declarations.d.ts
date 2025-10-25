// file: declarations.d.ts

declare module 'vietqr-js' {
  // Định nghĩa cấu trúc cho các tham số khi khởi tạo VietQR
  interface VietQRConstructorOptions {
    bankBin: string;
    bankNumber: string;
    accountName: string;
  }

  // Định nghĩa cấu trúc cho các tham số khi tạo link QR
  interface GenQuickLinkOptions {
    amount?: number;
    addInfo?: string;
  }

  // Khai báo lớp VietQR và các phương thức của nó
  export class VietQR {
    constructor(options: VietQRConstructorOptions);
    genQuickLink(options: GenQuickLinkOptions): string;
  }
}