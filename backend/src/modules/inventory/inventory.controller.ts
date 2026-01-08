import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimpleModuleAccessGuard, RequireModule } from '../../common/guards/simple-module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, SimpleModuleAccessGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // ============ INVENTORY ITEMS ============

  @Post('items')
  @RequireModule(ModuleKey.INVENTORY)
  async createItem(@Body() body: any, @Request() req: any) {
    return this.inventoryService.createItem({
      ...body,
      organizationId: req.user.organizationId,
      createdById: req.user.userId,
    });
  }

  @Get('items')
  @RequireModule(ModuleKey.INVENTORY)
  async getItems(@Request() req: any, @Query() query: any) {
    return this.inventoryService.getItems(req.user.organizationId, {
      categoryId: query.categoryId,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
    });
  }

  @Get('items/:id')
  @RequireModule(ModuleKey.INVENTORY)
  async getItem(@Param('id') id: string) {
    return this.inventoryService.getItemById(id);
  }

  @Put('items/:id')
  @RequireModule(ModuleKey.INVENTORY)
  async updateItem(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateItem(id, body);
  }

  @Delete('items/:id')
  @RequireModule(ModuleKey.INVENTORY)
  async deleteItem(@Param('id') id: string) {
    return this.inventoryService.deleteItem(id);
  }

  // ============ TRANSACTIONS ============

  @Post('transactions')
  @RequireModule(ModuleKey.INVENTORY)
  async createTransaction(@Body() body: any, @Request() req: any) {
    return this.inventoryService.createTransaction({
      ...body,
      organizationId: req.user.organizationId,
      performedById: req.user.userId,
    });
  }

  @Get('items/:id/transactions')
  @RequireModule(ModuleKey.INVENTORY)
  async getItemTransactions(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.inventoryService.getItemTransactions(id, limit ? parseInt(limit) : 50);
  }

  // ============ WORK ORDER PARTS ============

  @Post('work-order-parts')
  @RequireModule(ModuleKey.INVENTORY)
  async addPartToWorkOrder(@Body() body: any, @Request() req: any) {
    return this.inventoryService.addPartToWorkOrder({
      ...body,
      addedById: req.user.userId,
    });
  }

  @Get('work-orders/:workOrderId/parts')
  @RequireModule(ModuleKey.INVENTORY)
  async getWorkOrderParts(@Param('workOrderId') workOrderId: string) {
    return this.inventoryService.getWorkOrderParts(workOrderId);
  }

  // ============ STOCK ALERTS ============

  @Get('alerts')
  @RequireModule(ModuleKey.INVENTORY)
  async getStockAlerts(@Request() req: any, @Query('resolved') resolved?: string) {
    const isResolved = resolved === 'true';
    return this.inventoryService.getStockAlerts(req.user.organizationId, isResolved);
  }
}
