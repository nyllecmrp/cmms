import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import type { CreateAssetDto, UpdateAssetDto } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimpleModuleAccessGuard, RequireModule } from '../../common/guards/simple-module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('assets')
@UseGuards(JwtAuthGuard, SimpleModuleAccessGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

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
}
