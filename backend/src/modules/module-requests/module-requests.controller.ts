import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ModuleRequestsService } from './module-requests.service';
import type { CreateModuleRequestDto, ReviewModuleRequestDto } from './module-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('module-requests')
@UseGuards(JwtAuthGuard)
export class ModuleRequestsController {
  constructor(private readonly moduleRequestsService: ModuleRequestsService) {}

  @Post()
  create(@Body() createModuleRequestDto: CreateModuleRequestDto) {
    return this.moduleRequestsService.create(createModuleRequestDto);
  }

  @Get('pending')
  findPending() {
    return this.moduleRequestsService.findPending();
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.moduleRequestsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleRequestsService.findOne(id);
  }

  @Patch(':id/review')
  review(@Param('id') id: string, @Body() reviewModuleRequestDto: ReviewModuleRequestDto) {
    return this.moduleRequestsService.review(id, reviewModuleRequestDto);
  }
}
