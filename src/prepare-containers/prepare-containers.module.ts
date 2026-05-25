import { Module } from '@nestjs/common';
import { PrepareContainersController } from './prepare-containers.controller';
import { PrepareContainersService } from './prepare-containers.service';

@Module({
  controllers: [PrepareContainersController],
  providers: [PrepareContainersService]
})
export class PrepareContainersModule {}
