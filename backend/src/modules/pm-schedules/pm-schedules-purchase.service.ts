import { Injectable } from '@nestjs/common';
import { PurchaseRequestsService } from '../purchase-requests/purchase-requests.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PMSchedulesPurchaseService {
  constructor(
    private purchaseRequestsService: PurchaseRequestsService,
    private inventoryService: InventoryService,
  ) {}

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

      console.log('📦 Parts from PM Schedule:', JSON.stringify(parts, null, 2));

      // Check inventory availability for each part
      const availability: any[] = await this.inventoryService.checkPartsAvailability(
        pmSchedule.organizationId,
        parts.map(p => ({
          name: p.name,
          partNumber: p.partNumber,
          quantity: p.quantity || 1
        }))
      );

      console.log('📊 Inventory Availability:', JSON.stringify(availability, null, 2));

      // Reserve parts that are available in inventory
      const partsToReserve = availability
        .filter((a: any) => a.inInventory && a.available > 0)
        .map((a: any) => ({
          inventoryItemId: a.inventoryItemId,
          quantity: a.available
        }));

      if (partsToReserve.length > 0) {
        await this.inventoryService.reservePartsForPM(pmSchedule.id, pmSchedule.organizationId, partsToReserve);
        console.log(`✅ Reserved ${partsToReserve.length} parts from inventory`);
      }

      // Only create purchase request for parts that need to be ordered
      const partsToOrder = availability
        .filter((a: any) => a.toOrder > 0)
        .map((a: any, index: number) => {
          const originalPart = parts[index];
          return {
            ...originalPart,
            name: a.partName,
            partNumber: a.partNumber,
            quantity: a.toOrder,
            estimatedCost: a.unitCost || originalPart.estimatedCost || originalPart.price || 0,
            note: a.inInventory ? `${a.available} available in inventory, ordering ${a.toOrder}` : 'Not in inventory'
          };
        });

      // If everything is available in inventory, no purchase request needed
      if (partsToOrder.length === 0) {
        console.log('✅ All parts available in inventory - no purchase request needed');
        return { type: 'inventory_only', reservedParts: partsToReserve.length };
      }

      // Calculate estimated cost for parts to order
      const estimatedCost = partsToOrder.reduce((sum, part) => {
        const quantity = part.quantity || 1;
        const price = part.estimatedCost || part.price || 0;
        console.log(`  💰 Part to order: ${part.name}, Qty: ${quantity}, Price: ${price}, Subtotal: ${quantity * price}`);
        return sum + (quantity * price);
      }, 0);

      console.log(`💵 Total Estimated Cost: ${estimatedCost}`);

      // Create purchase request only for parts that need ordering
      const purchaseRequest = await this.purchaseRequestsService.create({
        organizationId: pmSchedule.organizationId,
        title: `Parts for PM: ${pmSchedule.name}`,
        description: `Auto-generated purchase request for preventive maintenance schedule: ${pmSchedule.name}. ${partsToReserve.length > 0 ? `(${partsToReserve.length} parts reserved from inventory)` : ''}`,
        priority: pmSchedule.priority || 'medium',
        type: 'parts',
        pmScheduleId: pmSchedule.id,
        assetId: pmSchedule.assetId || undefined,
        items: JSON.stringify(partsToOrder),
        estimatedCost: estimatedCost > 0 ? estimatedCost : undefined,
        notes: `Due date: ${pmSchedule.nextDue}${partsToReserve.length > 0 ? `\n\nReserved from inventory: ${partsToReserve.length} parts` : ''}`,
        requestedById: createdById,
      });

      return purchaseRequest;
    } catch (error) {
      console.error('Error creating purchase request for PM schedule:', error);
      return null;
    }
  }
}
