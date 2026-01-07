import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';
import { SubscriptionTier, ModuleCode } from '../../common/constants/modules.constant';

export interface CreateSubscriptionDto {
  organizationId: string;
  tier: SubscriptionTier;
  userCount: number;
  billingCycle: 'monthly' | 'annual';
  paymentMethod: 'gcash' | 'paymaya' | 'bank_transfer' | 'credit_card';
}

export interface ProcessPaymentDto {
  organizationId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: any;
}

@Injectable()
export class BillingService {
  constructor(private db: DatabaseService) {}

  /**
   * Calculate subscription price
   */
  calculateSubscriptionPrice(tier: SubscriptionTier, userCount: number, billingCycle: 'monthly' | 'annual') {
    const PRICING = {
      starter: { base: 3500, perUser: 250 },
      professional: { base: 8000, perUser: 400 },
      enterprise: { base: 15000, perUser: 600 },
      enterprise_plus: { base: 25000, perUser: 800 },
    };

    const tierPricing = PRICING[tier];
    if (!tierPricing) {
      throw new BadRequestException('Invalid tier');
    }

    const monthlyPrice = tierPricing.base + (userCount * tierPricing.perUser);
    const annualPrice = monthlyPrice * 12 * 0.83; // 17% discount

    return {
      tier,
      userCount,
      billingCycle,
      monthlyPrice,
      annualPrice,
      totalPrice: billingCycle === 'monthly' ? monthlyPrice : annualPrice,
      currency: 'PHP',
      discount: billingCycle === 'annual' ? monthlyPrice * 12 - annualPrice : 0,
    };
  }

  /**
   * Create a subscription
   */
  async createSubscription(dto: CreateSubscriptionDto) {
    const pricing = this.calculateSubscriptionPrice(dto.tier, dto.userCount, dto.billingCycle);

    const id = randomBytes(16).toString('hex');
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (dto.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await this.db.execute(
      `INSERT INTO Subscription (
        id, organizationId, tier, userCount, billingCycle,
        monthlyPrice, annualPrice, totalPrice, currency,
        status, startDate, endDate, paymentMethod, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        dto.organizationId,
        dto.tier,
        dto.userCount,
        dto.billingCycle,
        pricing.monthlyPrice,
        pricing.annualPrice,
        pricing.totalPrice,
        pricing.currency,
        'pending', // Will be activated after payment
        startDate.toISOString(),
        endDate.toISOString(),
        dto.paymentMethod,
      ]
    );

    const subscriptions = await this.db.query(
      'SELECT * FROM Subscription WHERE id = ?',
      [id]
    );

    return subscriptions[0];
  }

  /**
   * Process payment
   * This is a placeholder - integrate with actual payment gateway
   */
  async processPayment(dto: ProcessPaymentDto) {
    const paymentId = randomBytes(16).toString('hex');

    // TODO: Integrate with actual payment gateway (GCash, PayMaya, etc.)
    // For now, we'll create a payment record

    await this.db.execute(
      `INSERT INTO Payment (
        id, organizationId, amount, currency, paymentMethod,
        status, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        paymentId,
        dto.organizationId,
        dto.amount,
        dto.currency,
        dto.paymentMethod,
        'pending',
        dto.metadata ? JSON.stringify(dto.metadata) : null,
      ]
    );

    return {
      paymentId,
      status: 'pending',
      message: 'Payment initiated. Please complete the payment process.',
      // In production, return payment gateway URL/details here
    };
  }

  /**
   * Confirm payment (webhook handler)
   */
  async confirmPayment(paymentId: string, transactionId: string) {
    await this.db.execute(
      `UPDATE Payment
      SET status = ?, transactionId = ?, updatedAt = datetime('now')
      WHERE id = ?`,
      ['completed', transactionId, paymentId]
    );

    // Get payment details
    const payments = await this.db.query(
      'SELECT * FROM Payment WHERE id = ?',
      [paymentId]
    );

    const payment = payments[0];

    // Activate subscription if this was a subscription payment
    if (payment.metadata) {
      const metadata = JSON.parse(payment.metadata);
      if (metadata.subscriptionId) {
        await this.activateSubscription(metadata.subscriptionId);
      }
    }

    return payment;
  }

  /**
   * Activate subscription after payment
   */
  async activateSubscription(subscriptionId: string) {
    await this.db.execute(
      `UPDATE Subscription
      SET status = ?, updatedAt = datetime('now')
      WHERE id = ?`,
      ['active', subscriptionId]
    );

    // Get subscription details to activate modules
    const subscriptions = await this.db.query(
      'SELECT * FROM Subscription WHERE id = ?',
      [subscriptionId]
    );

    const subscription = subscriptions[0];

    // Update organization tier
    await this.db.execute(
      `UPDATE Organization
      SET tier = ?, updatedAt = datetime('now')
      WHERE id = ?`,
      [subscription.tier, subscription.organizationId]
    );

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, reason?: string) {
    await this.db.execute(
      `UPDATE Subscription
      SET status = ?, cancellationReason = ?, cancelledAt = datetime('now'), updatedAt = datetime('now')
      WHERE id = ?`,
      ['cancelled', reason || null, subscriptionId]
    );

    const subscriptions = await this.db.query(
      'SELECT * FROM Subscription WHERE id = ?',
      [subscriptionId]
    );

    return subscriptions[0];
  }

  /**
   * Get organization's active subscription
   */
  async getActiveSubscription(organizationId: string) {
    const subscriptions = await this.db.query(
      `SELECT * FROM Subscription
      WHERE organizationId = ?
      AND status = 'active'
      ORDER BY createdAt DESC
      LIMIT 1`,
      [organizationId]
    );

    return subscriptions[0] || null;
  }

  /**
   * Get payment history for organization
   */
  async getPaymentHistory(organizationId: string) {
    const payments = await this.db.query(
      `SELECT * FROM Payment
      WHERE organizationId = ?
      ORDER BY createdAt DESC`,
      [organizationId]
    );

    return payments;
  }

  /**
   * Generate invoice
   */
  async generateInvoice(subscriptionId: string) {
    const invoiceId = randomBytes(16).toString('hex');

    const subscriptions = await this.db.query(
      'SELECT * FROM Subscription WHERE id = ?',
      [subscriptionId]
    );

    const subscription = subscriptions[0];

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const organizations = await this.db.query(
      'SELECT * FROM Organization WHERE id = ?',
      [subscription.organizationId]
    );

    const organization = organizations[0];

    await this.db.execute(
      `INSERT INTO Invoice (
        id, organizationId, subscriptionId, amount, currency,
        status, invoiceNumber, dueDate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        invoiceId,
        subscription.organizationId,
        subscriptionId,
        subscription.totalPrice,
        subscription.currency,
        'pending',
        `INV-${Date.now()}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      ]
    );

    const invoices = await this.db.query(
      'SELECT * FROM Invoice WHERE id = ?',
      [invoiceId]
    );

    return invoices[0];
  }

  /**
   * Check if subscription is due for renewal
   */
  async checkRenewalDue(organizationId: string) {
    const subscription = await this.getActiveSubscription(organizationId);

    if (!subscription) {
      return { isDue: false, daysRemaining: null };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isDue: daysRemaining <= 7,
      daysRemaining,
      subscription,
    };
  }
}
