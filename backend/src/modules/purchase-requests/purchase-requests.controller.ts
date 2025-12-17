import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  PurchaseRequestsService,
  type CreatePurchaseRequestDto,
  type UpdatePurchaseRequestDto,
  ApprovePurchaseRequestDto,
  RejectPurchaseRequestDto,
} from './purchase-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase-requests')
@UseGuards(JwtAuthGuard)
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestsService: PurchaseRequestsService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseRequestDto, @Request() req) {
    return this.purchaseRequestsService.create({
      ...createDto,
      organizationId: req.user.organizationId,
      requestedById: req.user.userId,
    });
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.purchaseRequestsService.findAll(req.user.organizationId, status);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.purchaseRequestsService.getStats(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseRequestsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseRequestDto) {
    return this.purchaseRequestsService.update(id, updateDto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.purchaseRequestsService.approve(id, {
      approvedById: req.user.userId,
    });
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { rejectionReason: string }, @Request() req) {
    return this.purchaseRequestsService.reject(id, {
      rejectedById: req.user.userId,
      rejectionReason: body.rejectionReason,
    });
  }

  @Patch(':id/mark-purchased')
  markAsPurchased(@Param('id') id: string, @Body() body: { actualCost?: number }) {
    return this.purchaseRequestsService.markAsPurchased(id, body.actualCost);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseRequestsService.remove(id);
  }
}
