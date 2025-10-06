// src/navigation/types.tsx

import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

// --- Sao chép lại các kiểu dữ liệu này từ màn hình của bạn ---
// Hoặc import chúng nếu bạn đã định nghĩa ở một file riêng
type TableInfo = { id: string; name: string };

export interface BillItem {
  name: string;
  quantity: number;
  unit_price: number;
  totalPrice: number;
}

export interface ProvisionalOrder {
  orderId: string;
  tables: TableInfo[];
  totalPrice: number;
  totalItemCount: number;
  createdAt: string;
}

// --- Đây là phần quan trọng nhất ---
// Định nghĩa tất cả các màn hình và tham số của chúng
export type RootStackParamList = {
  ProvisionalBill: undefined; // Màn hình này không cần tham số khi điều hướng tới
  PrintPreview: {
    // Màn hình này CẦN tham số
    order: ProvisionalOrder;
    items: BillItem[];
  };
  // Thêm các màn hình khác của bạn ở đây...
  // Example: Login: undefined;
  // Example: ProductDetail: { productId: string };
};

// Kiểu cho navigation prop của màn hình ProvisionalBill
export type ProvisionalBillNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProvisionalBill'
>;

// Kiểu cho props (route và navigation) của màn hình PrintPreview
export type PrintPreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'PrintPreview'>;
