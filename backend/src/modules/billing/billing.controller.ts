import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionTier } from '../../common/constants/modules.constant';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Calculate subscription price
   * GET /billing/calculate-price
   */
  @Get('calculate-price')
  calculatePrice(
    @Query('tier') tier: SubscriptionTier,
    @Query('userCount') userCount: string,
    @Query('billingCycle') billingCycle: 'monthly' | 'annual',
  ) {
    return this.billingService.calculateSubscriptionPrice(
      tier,
      parseInt(userCount),
      billingCycle,
    );
  }

  /**
   * Create subscription
   * POST /billing/subscriptions
   */
  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  createSubscription(
    @Body()
    body: {
      organizationId: string;
      tier: SubscriptionTier;
      userCount: number;
      billingCycle: 'monthly' | 'annual';
      paymentMethod: 'gcash' | 'paymaya' | 'bank_transfer' | 'credit_card';
    },
  ) {
    return this.billingService.createSubscription(body);
  }

  /**
   * Process payment
   * POST /billing/payments
   */
  @Post('payments')
  @UseGuards(JwtAuthGuard)
  processPayment(
    @Body()
    body: {
      organizationId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      metadata?: any;
    },
  ) {
    return this.billingService.processPayment(body);
  }

  /**
   * Confirm payment (webhook)
   * POST /billing/payments/:paymentId/confirm
   */
  @Post('payments/:paymentId/confirm')
  confirmPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.billingService.confirmPayment(paymentId, body.transactionId);
  }

  /**
   * Get active subscription
   * GET /billing/organizations/:organizationId/subscription
   */
  @Get('organizations/:organizationId/subscription')
  @UseGuards(JwtAuthGuard)
  getActiveSubscription(@Param('organizationId') organizationId: string) {
    return this.billingService.getActiveSubscription(organizationId);
  }

  /**
   * Cancel subscription
   * PUT /billing/subscriptions/:subscriptionId/cancel
   */
  @Put('subscriptions/:subscriptionId/cancel')
  @UseGuards(JwtAuthGuard)
  cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { reason?: string },
  ) {
    return this.billingService.cancelSubscription(subscriptionId, body.reason);
  }

  /**
   * Get payment history
   * GET /billing/organizations/:organizationId/payments
   */
  @Get('organizations/:organizationId/payments')
  @UseGuards(JwtAuthGuard)
  getPaymentHistory(@Param('organizationId') organizationId: string) {
    return this.billingService.getPaymentHistory(organizationId);
  }

  /**
   * Generate invoice
   * POST /billing/subscriptions/:subscriptionId/invoice
   */
  @Post('subscriptions/:subscriptionId/invoice')
  @UseGuards(JwtAuthGuard)
  generateInvoice(@Param('subscriptionId') subscriptionId: string) {
    return this.billingService.generateInvoice(subscriptionId);
  }

  /**
   * Check renewal status
   * GET /billing/organizations/:organizationId/renewal-status
   */
  @Get('organizations/:organizationId/renewal-status')
  @UseGuards(JwtAuthGuard)
  checkRenewalStatus(@Param('organizationId') organizationId: string) {
    return this.billingService.checkRenewalDue(organizationId);
  }
}
