import { Injectable } from '@nestjs/common';
import { PurchaseRequestsService } from '../purchase-requests/purchase-requests.service';

@Injectable()
export class PMSchedulesPurchaseService {
  constructor(private purchaseRequestsService: PurchaseRequestsService) {}

  async createPurchaseRequestForPMSchedule(pmSchedule: any, createdById: string) {
    // Check if PM schedule has parts defined
    if (!pmSchedule.parts) {
      return null;
    }

    try {
      const parts = JSON.parse(pmSchedule.parts);

      // Only create if there are parts
      if (!Array.isArray(parts) || parts.length === 0) {
        return null;
      }

      // Calculate estimated cost if parts have prices
      let estimatedCost = 0;
      console.log('📦 Parts from PM Schedule:', JSON.stringify(parts, null, 2));

      if (parts.some(part => part.estimatedCost || part.price)) {
        estimatedCost = parts.reduce((sum, part) => {
          const quantity = part.quantity || 1;
          const price = part.estimatedCost || part.price || 0;
          console.log(`  💰 Part: ${part.name}, Qty: ${quantity}, Price: ${price}, Subtotal: ${quantity * price}`);
          return sum + (quantity * price);
        }, 0);
      }

      console.log(`💵 Total Estimated Cost: ${estimatedCost}`);

      // Create purchase request
      const purchaseRequest = await this.purchaseRequestsService.create({
        organizationId: pmSchedule.organizationId,
        title: `Parts for PM: ${pmSchedule.name}`,
        description: `Auto-generated purchase request for preventive maintenance schedule: ${pmSchedule.name}`,
        priority: pmSchedule.priority || 'medium',
        type: 'parts',
        pmScheduleId: pmSchedule.id,
        assetId: pmSchedule.assetId || undefined,
        items: JSON.stringify(parts),
        estimatedCost: estimatedCost > 0 ? estimatedCost : undefined,
        notes: `Due date: ${pmSchedule.nextDue}`,
        requestedById: createdById,
      });

      return purchaseRequest;
    } catch (error) {
      console.error('Error creating purchase request for PM schedule:', error);
      return null;
    }
  }
}
