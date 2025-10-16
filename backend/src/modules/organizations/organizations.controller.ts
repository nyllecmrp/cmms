import { Controller, Get, Post, Param, UseGuards, Patch, Body, Delete } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  create(@Body() createData: any) {
    return this.organizationsService.create(createData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.organizationsService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.organizationsService.delete(id);
  }

  @Post(':id/create-admin')
  createAdmin(@Param('id') id: string, @Body() body: { password: string; fullName: string }) {
    return this.organizationsService.createAdminUser(id, body.password, body.fullName);
  }
}
