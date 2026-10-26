import QRCode from 'qrcode';
import type { Bill } from '../types/pos';

/**
 * Builds the official NPCI UPI deep link with prefilled amount
 * Format: upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiPaymentUrl(params: {
  vpa: string;
  merchantName: string;
  amount: number;
  note: string;
}): string {
  const vpaClean = encodeURIComponent(params.vpa.trim());
  const nameClean = encodeURIComponent(params.merchantName.trim());
  const formattedAmount = params.amount.toFixed(2);
  const noteClean = encodeURIComponent(params.note.trim());

  return `upi://pay?pa=${vpaClean}&pn=${nameClean}&am=${formattedAmount}&cu=INR&tn=${noteClean}`;
}

/**
 * Generates high-contrast Data URL image for a string using qrcode library
 */
export async function generateQrDataUrl(text: string, color = '#000000'): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: color,
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Generates a verification signature / hash for a bill
 */
export function createBillVerificationPayload(bill: Bill): string {
  const compact = {
    v: 1, // version
    id: bill.billNumber,
    ts: bill.timestamp,
    n: bill.customerName || 'Walk-in',
    cnt: bill.items.reduce((sum, item) => sum + item.quantity, 0),
    tot: bill.finalTotal,
    pm: bill.paymentMethod,
    st: bill.paymentStatus,
    sig: bill.verificationHash,
  };
  return JSON.stringify(compact);
}

/**
 * Generates a mock signature for tamper protection
 */
export function generateBillHash(billNumber: string, total: number, timestamp: number): string {
  const raw = `${billNumber}-${total}-${timestamp}-smartbill-secret`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
