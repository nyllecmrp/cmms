import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import type { CreateAssetDto, UpdateAssetDto } from './assets.service';
import { AssetPartsService } from './asset-parts.service';
import type { AddAssetPartDto, UpdateAssetPartDto, BulkAddAssetPartsDto } from './asset-parts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimpleModuleAccessGuard, RequireModule } from '../../common/guards/simple-module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('assets')
@UseGuards(JwtAuthGuard, SimpleModuleAccessGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetPartsService: AssetPartsService,
  ) {}

  @Post()
  @RequireModule(ModuleKey.ASSETS)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @RequireModule(ModuleKey.ASSETS)
  findAll(@Query('organizationId') organizationId: string) {
    return this.assetsService.findAll(organizationId);
  }

  @Get('stats/by-category')
  @RequireModule(ModuleKey.ASSETS)
  getStatsByCategory(@Query('organizationId') organizationId: string) {
    return this.assetsService.getStatsByCategory(organizationId);
  }

  @Get(':id/maintenance-history')
  @RequireModule(ModuleKey.ASSETS)
  getMaintenanceHistory(@Param('id') id: string) {
    return this.assetsService.getMaintenanceHistory(id);
  }

  @Get(':id')
  @RequireModule(ModuleKey.ASSETS)
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @RequireModule(ModuleKey.ASSETS)
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @RequireModule(ModuleKey.ASSETS)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  // ========== Asset Parts Management ==========

  @Get(':id/parts')
  @RequireModule(ModuleKey.ASSETS)
  getAssetParts(@Param('id') assetId: string) {
    return this.assetPartsService.getAssetParts(assetId);
  }

  @Post(':id/parts')
  @RequireModule(ModuleKey.ASSETS)
  addPartToAsset(@Param('id') assetId: string, @Body() data: Omit<AddAssetPartDto, 'assetId'>) {
    return this.assetPartsService.addPartToAsset({ ...data, assetId });
  }

  @Post(':id/parts/bulk')
  @RequireModule(ModuleKey.ASSETS)
  bulkAddPartsToAsset(@Param('id') assetId: string, @Body() data: Omit<BulkAddAssetPartsDto, 'assetId'>) {
    return this.assetPartsService.bulkAddPartsToAsset({ ...data, assetId });
  }

  @Patch('parts/:partId')
  @RequireModule(ModuleKey.ASSETS)
  updateAssetPart(@Param('partId') partId: string, @Body() data: UpdateAssetPartDto) {
    return this.assetPartsService.updateAssetPart(partId, data);
  }

  @Delete('parts/:partId')
  @RequireModule(ModuleKey.ASSETS)
  removePartFromAsset(@Param('partId') partId: string) {
    return this.assetPartsService.removePartFromAsset(partId);
  }

  @Post(':id/parts/bulk-remove')
  @RequireModule(ModuleKey.ASSETS)
  bulkRemovePartsFromAsset(@Param('id') assetId: string, @Body() data: { itemIds: string[] }) {
    return this.assetPartsService.bulkRemovePartsFromAsset(assetId, data.itemIds);
  }

  @Get('inventory/search')
  @RequireModule(ModuleKey.ASSETS)
  searchInventoryItems(
    @Query('organizationId') organizationId: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.assetPartsService.searchInventoryItems(
      organizationId,
      searchTerm,
      categoryId,
      limit ? parseInt(limit) : 50,
    );
  }
}
