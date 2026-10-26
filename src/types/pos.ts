export type ProductCategory = 
  | 'All'
  | 'Grocery'
  | 'Snacks'
  | 'Beverages'
  | 'Dairy'
  | 'Personal Care'
  | 'Household';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  gstRate: number; // e.g. 5, 12, 18
}

export interface CartItem {
  product: Product;
  quantity: number;
  itemDiscountPercent: number;
}

export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'SPLIT';

export interface Bill {
  id: string;
  billNumber: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  isOwnerDiscountApproved: boolean;
  gstAmount: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELLED';
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  verificationHash: string; // Used in bill verification QR
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  upiId: string;
  upiMerchantName: string;
  maxCashierDiscountPercent: number; // e.g., 5%
  ownerPin: string; // e.g., '1234'
  enableGst: boolean;
  currencySymbol: string;
  receiptFooter: string;
}

export type ActiveTab = 'billing' | 'inventory' | 'invoices' | 'analytics' | 'settings';
