import { Module } from '@nestjs/common';
import { PrepareContainersModule } from './prepare-containers/prepare-containers.module';

@Module({
  imports: [PrepareContainersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
