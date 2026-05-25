import { Module } from '@nestjs/common';
import { WatermarkController } from './watermark.controller';
import { WatermarkProcessorService } from './watermark-processor.service';
import { WatermarkService } from './watermark.service';

@Module({
  controllers: [WatermarkController],
  providers: [WatermarkService, WatermarkProcessorService],
})
export class WatermarkModule {}
