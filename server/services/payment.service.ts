import crypto from 'crypto';
import { queryOne, run, transaction } from '../db.js';

export interface PaymentIntentResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  provider: string;
  checkoutUrl?: string;
  transactionReference: string;
  instructions?: string;
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  status?: 'PAID' | 'FAILED';
  error?: string;
}

export class PaymentGatewayService {
  private static getWebhookSecret(): string {
    return process.env.PAYMENT_WEBHOOK_SECRET || 'dev_payment_webhook_secret_key_chaudhary_f10';
  }

  // Create payment intent / transaction record
  public static async createPaymentTransaction(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    customerEmail: string;
    customerPhone: string;
  }): Promise<PaymentIntentResult> {
    const provider = process.env.PAYMENT_PROVIDER || (order.paymentMethod === 'cod' ? 'cod' : 'payfast');
    const txRef = `TX_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    // Insert pending payment record
    run(
      `INSERT INTO payments (id, order_id, amount, currency, provider, payment_method, status, transaction_reference, created_at, updated_at)
       VALUES (?, ?, ?, 'PKR', ?, ?, 'pending', ?, ?, ?);`,
      [paymentId, order.id, order.totalAmount, provider, order.paymentMethod, txRef, now, now]
    );

    // Insert payment transaction log
    run(
      `INSERT INTO payment_transactions (id, payment_id, order_id, amount, provider_tx_id, status, payload, created_at)
       VALUES (?, ?, ?, ?, ?, 'initiated', ?, ?);`,
      [`ptx_${now}_${crypto.randomBytes(4).toString('hex')}`, paymentId, order.id, order.totalAmount, txRef, JSON.stringify({ method: order.paymentMethod, provider }), now]
    );

    if (order.paymentMethod === 'cod') {
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        paymentMethod: 'cod',
        provider: 'cod',
        transactionReference: txRef,
        instructions: 'Pay cash upon delivery. Our technician will verify your battery and provide the stamped official warranty card.'
      };
    }

    if (order.paymentMethod === 'bank_transfer') {
      const bankDetails = `Meezan Bank Limited\nTitle: Chaudhary Battery And UPS\nAccount / IBAN: PK42MEZN0000100123456789\nBranch: F-10 Markaz Islamabad\nReference: Order #${order.orderNumber}`;
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        paymentMethod: 'bank_transfer',
        provider: 'bank_transfer',
        transactionReference: txRef,
        instructions: bankDetails
      };
    }

    // Online Payment Gateway (PayFast / JazzCash / EasyPaisa / Hosted Secure Portal)
    const checkoutUrl = `/checkout/pay/${order.id}?ref=${txRef}`;

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      provider: provider,
      checkoutUrl,
      transactionReference: txRef
    };
  }

  // Verifies the HMAC-SHA256 signature sent by the payment provider webhook
  public static verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    const secret = this.getWebhookSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  // Process server-side payment confirmation with idempotency
  public static async processWebhookConfirmation(data: {
    orderId: string;
    transactionReference: string;
    providerTxId: string;
    amount: number;
    status: 'PAID' | 'FAILED';
    rawPayload: any;
  }): Promise<{ success: boolean; message: string }> {
    return transaction(() => {
      // 1. Retrieve order
      const order = queryOne<any>(
        'SELECT id, order_number, total_amount, payment_status, order_status FROM orders WHERE id = ?;',
        [data.orderId]
      );

      if (!order) {
        return { success: false, message: 'Order not found for payment reference' };
      }

      // Idempotency: if already paid, do not re-process
      if (order.payment_status === 'paid') {
        return { success: true, message: 'Order already marked as paid (Idempotent response)' };
      }

      // 2. Validate amount matches exactly
      if (Math.abs(order.total_amount - data.amount) > 0.01) {
        console.error(`[Payment Security Alert] Amount mismatch! Order expected: ${order.total_amount}, Webhook received: ${data.amount}`);
        return { success: false, message: 'Payment amount mismatch detected. Order rejected for security.' };
      }

      const now = Date.now();

      if (data.status === 'PAID') {
        // Update payment table
        run(
          `UPDATE payments SET status = 'paid', transaction_reference = ?, raw_response = ?, updated_at = ?
           WHERE order_id = ?;`,
          [data.providerTxId, JSON.stringify(data.rawPayload), now, data.orderId]
        );

        // Update order status
        run(
          `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', updated_at = ?
           WHERE id = ?;`,
          [now, data.orderId]
        );

        // Record order status history
        run(
          `INSERT INTO order_status_history (id, order_id, status, notes, changed_by, created_at)
           VALUES (?, ?, 'confirmed', 'Online payment verified by payment gateway', 'system_webhook', ?);`,
          [`osh_${now}_${Math.random().toString(36).substring(2, 6)}`, data.orderId, now]
        );

        // Record payment transaction
        run(
          `INSERT INTO payment_transactions (id, order_id, amount, provider_tx_id, status, payload, created_at)
           VALUES (?, ?, ?, ?, 'success', ?, ?);`,
          [`ptx_${now}_${crypto.randomBytes(4).toString('hex')}`, data.orderId, data.amount, data.providerTxId, JSON.stringify(data.rawPayload), now]
        );

        return { success: true, message: 'Payment confirmed and verified by server' };
      } else {
        run(
          `UPDATE payments SET status = 'failed', updated_at = ? WHERE order_id = ?;`,
          [now, data.orderId]
        );
        run(
          `UPDATE orders SET payment_status = 'failed', updated_at = ? WHERE id = ?;`,
          [now, data.orderId]
        );
        return { success: true, message: 'Payment failure recorded' };
      }
    });
  }
}
