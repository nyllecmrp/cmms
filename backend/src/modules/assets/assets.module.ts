import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetPartsService } from './asset-parts.service';
import { AssetsController } from './assets.controller';

@Module({
  imports: [],
  controllers: [AssetsController],
  providers: [AssetsService, AssetPartsService],
  exports: [AssetsService, AssetPartsService],
})
export class AssetsModule {}
