import { Module } from '@nestjs/common';
import { PrepareContainersModule } from './prepare-containers/prepare-containers.module';
import { WatermarkModule } from './watermark/watermark.module';

@Module({
  imports: [PrepareContainersModule, WatermarkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
