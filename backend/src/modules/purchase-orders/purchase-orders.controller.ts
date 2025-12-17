import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './purchase-orders.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query('status') status?: string) {
    return this.purchaseOrdersService.findAll(organizationId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, updateDto);
  }

  @Post(':id/send')
  sendPO(@Param('id') id: string, @Body('approvedById') approvedById: string) {
    return this.purchaseOrdersService.sendPO(id, approvedById);
  }

  @Post(':id/receive')
  receivePO(
    @Param('id') id: string,
    @Body('receivedById') receivedById: string,
    @Body('actualDelivery') actualDelivery?: string
  ) {
    return this.purchaseOrdersService.receivePO(id, receivedById, actualDelivery);
  }

  @Post(':id/cancel')
  cancelPO(@Param('id') id: string) {
    return this.purchaseOrdersService.cancelPO(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
