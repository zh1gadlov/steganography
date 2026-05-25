import {
  Body,
  Controller,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { WatermarkService } from './watermark.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateWatermarkDtoRequest } from './dto/generate-watermark-dto';

@Controller('watermark')
export class WatermarkController {
  constructor(private readonly watermarkService: WatermarkService) {}

  @Post('generate')
  @UseInterceptors(FileInterceptor('image'))
  async generateWatermark(
    @Body() params: GenerateWatermarkDtoRequest,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const { file, fileName } = await this.watermarkService.generateWatermark({
      ...params,
      image,
    });

    return new StreamableFile(file, {
      type: 'image/bmp',
      disposition: `attachment; filename="${fileName}.bmp"`,
    });
  }

  @Post('extract')
  @UseInterceptors(FileInterceptor('image'))
  async extractWatermark(
    @Body() params: GenerateWatermarkDtoRequest,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const { file, fileName } = await this.watermarkService.extractWatermark({
      ...params,
      image,
    });

    return new StreamableFile(file, {
      type: 'image/png',
      disposition: `attachment; filename="${fileName}.png"`,
    });
  }
}
