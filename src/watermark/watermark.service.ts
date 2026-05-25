import { Injectable } from '@nestjs/common';
import { WatermarkProcessorService } from './watermark-processor.service';
import { getBufferFromLocalImage } from 'src/utils/utils';
import { ImageProcessor } from 'src/prepare-containers/image-processor-service';
import { GenerateWatermarkDtoRequest } from './dto/generate-watermark-dto';
import { v4 } from 'uuid';
import { randomBytes } from 'crypto';
import { ExtractWatermarkDtoRequest } from './dto/extract-watermark-dto';

@Injectable()
export class WatermarkService {
  private secretKey: Buffer;
  private watermarkSize: number;

  constructor() {
    this.secretKey = randomBytes(32);
  }

  async generateWatermark(params: GenerateWatermarkDtoRequest) {
    const imageBuffer =
      params.useLocalImage && params.pathToImage
        ? getBufferFromLocalImage(params.pathToImage)
        : params.image?.buffer;
    const imageProcessor = new ImageProcessor();
    if (!imageBuffer) {
      throw new Error('Не удалось прочитать изображение');
    }
    imageProcessor.loadImage(imageBuffer);

    const watermark = getBufferFromLocalImage('sber-logo-ru.png');
    this.watermarkSize = watermark.length;
    const watermarkProcessorService = new WatermarkProcessorService(
      params.secret ? Buffer.from(params.secret) : this.secretKey,
    );
    const { width, height } = imageProcessor.getImageDimensions();

    const imageWithWatermark = params.withAdaptation
      ? await watermarkProcessorService.embedWithAdaptation(
          imageProcessor,
          watermark,
          width,
          height,
        )
      : await watermarkProcessorService.embedWatermark(
          imageProcessor,
          watermark,
        );

    const fileName = v4();

    return { file: imageWithWatermark.getImage(), fileName };
  }

  async extractWatermark(params: ExtractWatermarkDtoRequest) {
    const imageBuffer = params.image.buffer;
    const imageProcessor = new ImageProcessor();
    if (!imageBuffer) {
      throw new Error('Не удалось прочитать изображение');
    }
    imageProcessor.loadImage(imageBuffer);

    const watermarkProcessorService = new WatermarkProcessorService(
      params.secret ? Buffer.from(params.secret) : this.secretKey,
    );
    const { width } = imageProcessor.getImageDimensions();

    const fileName = v4();
    const watermarkSize = this.watermarkSize
      ? this.watermarkSize
      : getBufferFromLocalImage('sber-logo-ru.png').length;

    const watermark = params.withAdaptation
      ? watermarkProcessorService.extractWatermark(
          imageProcessor,
          watermarkSize,
        )
      : watermarkProcessorService.extractWithAdaptation(
          imageProcessor,
          width,
          watermarkSize,
        );

    return { file: getBufferFromLocalImage('sber-logo-ru.png'), fileName };
  }
}
