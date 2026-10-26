import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, Bill, StoreSettings, ActiveTab, PaymentMethod } from '../types/pos';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/mockProducts';
import { playScanBeep, playSuccessChime, playWarningBuzz } from '../utils/audio';
import { generateBillHash } from '../utils/qr';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  bills: Bill[];
  settings: StoreSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Cart
  addToCart: (product: Product, qty?: number) => void;
  addByBarcode: (barcode: string) => { success: boolean; message: string; product?: Product };
  updateCartItemQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Totals & Discount Protection
  cartSubtotal: number;
  cartGstAmount: number;
  discountPercent: number;
  discountAmount: number;
  cartTotal: number;
  isOwnerApproved: boolean;
  setDiscount: (percent: number) => { requiresPin: boolean };
  verifyAndApproveOwnerPin: (pin: string) => boolean;
  cancelOwnerApproval: () => void;

  // Checkout
  activeBill: Bill | null;
  setActiveBill: (bill: Bill | null) => void;
  completeSale: (paymentMethod: PaymentMethod, customerName?: string, customerPhone?: string) => Bill;

  // Inventory
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, quantity: number) => void;

  // Settings & Reset
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetAllData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'smartbill_products_v1',
  BILLS: 'smartbill_bills_v1',
  SETTINGS: 'smartbill_settings_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 2. Bills History State
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // 4. Cart & UI State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('billing');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isOwnerApproved, setIsOwnerApproved] = useState<boolean>(false);
  const [activeBill, setActiveBill] = useState<Bill | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    } catch (e) {
      console.error(e);
    }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Cart operations
  const addToCart = (product: Product, qty = 1) => {
    // Check if in stock
    if (product.stock <= 0) {
      playWarningBuzz();
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(qty, product.stock), itemDiscountPercent: 0 }];
      }
    });

    playScanBeep();
  };

  const addByBarcode = (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return { success: false, message: 'Please enter a barcode' };

    const product = products.find(
      (p) => p.barcode === cleanBarcode || p.name.toLowerCase().includes(cleanBarcode.toLowerCase())
    );

    if (!product) {
      playWarningBuzz();
      return { success: false, message: `No product found for barcode "${cleanBarcode}"` };
    }

    if (product.stock <= 0) {
      playWarningBuzz();
      return { success: false, message: `"${product.name}" is OUT OF STOCK!` };
    }

    addToCart(product, 1);
    return { success: true, message: `Added ${product.name}`, product };
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const safeQty = Math.min(quantity, product.stock);
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: safeQty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setIsOwnerApproved(false);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Discount calculation
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const afterDiscount = Math.max(0, cartSubtotal - discountAmount);

  // GST Calculation (if enabled)
  const cartGstAmount = settings.enableGst
    ? Math.round(
        cart.reduce((sum, item) => {
          const itemTotal = item.product.price * item.quantity;
          const shareOfDiscount = cartSubtotal > 0 ? (itemTotal / cartSubtotal) * discountAmount : 0;
          const taxable = Math.max(0, itemTotal - shareOfDiscount);
          return sum + (taxable * item.product.gstRate) / 100;
        }, 0)
      )
    : 0;

  const cartTotal = afterDiscount + cartGstAmount;

  // Owner Discount PIN Protection
  const setDiscount = (percent: number) => {
    const clamped = Math.max(0, Math.min(percent, 50)); // Max 50%
    if (clamped > settings.maxCashierDiscountPercent && !isOwnerApproved) {
      playWarningBuzz();
      return { requiresPin: true };
    }
    setDiscountPercent(clamped);
    return { requiresPin: false };
  };

  const verifyAndApproveOwnerPin = (pin: string): boolean => {
    if (pin.trim() === settings.ownerPin.trim()) {
      setIsOwnerApproved(true);
      playSuccessChime();
      return true;
    } else {
      playWarningBuzz();
      return false;
    }
  };

  const cancelOwnerApproval = () => {
    setIsOwnerApproved(false);
    setDiscountPercent(0);
  };

  // Complete Checkout Sale
  const completeSale = (
    paymentMethod: PaymentMethod,
    customerName?: string,
    customerPhone?: string
  ): Bill => {
    const now = Date.now();
    const billNumber = `SB-${new Date().getFullYear()}-${(bills.length + 1001).toString()}`;
    const hash = generateBillHash(billNumber, cartTotal, now);

    const newBill: Bill = {
      id: `bill-${now}`,
      billNumber,
      timestamp: now,
      items: [...cart],
      subtotal: cartSubtotal,
      discountAmount,
      discountPercent,
      isOwnerDiscountApproved: isOwnerApproved,
      gstAmount: cartGstAmount,
      finalTotal: cartTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      customerName: customerName?.trim() || 'Walk-in Customer',
      customerPhone: customerPhone?.trim() || '',
      cashierName: 'Cashier 1',
      verificationHash: hash,
    };

    // 1. Decrement Stock from Inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((item) => item.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity),
          };
        }
        return prod;
      })
    );

    // 2. Save Bill
    setBills((prev) => [newBill, ...prev]);

    // 3. Audio & Celebration
    playSuccessChime();

    // 4. Set Active Bill for Receipt Modal
    setActiveBill(newBill);

    // 5. Reset Cart
    clearCart();

    return newBill;
  };

  // Inventory Operations
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const restockProduct = (id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + quantity } : p))
    );
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setBills([]);
    setSettings(DEFAULT_STORE_SETTINGS);
    setCart([]);
    localStorage.clear();
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        bills,
        settings,
        activeTab,
        setActiveTab,
        addToCart,
        addByBarcode,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartGstAmount,
        discountPercent,
        discountAmount,
        cartTotal,
        isOwnerApproved,
        setDiscount,
        verifyAndApproveOwnerPin,
        cancelOwnerApproval,
        activeBill,
        setActiveBill,
        completeSale,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
