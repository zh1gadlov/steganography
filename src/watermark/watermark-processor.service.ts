import { ImageProcessor } from 'src/prepare-containers/image-processor-service';
import { calculateGradient } from 'src/utils/utils';

export class WatermarkProcessorService {
  private secretKey: Buffer;

  constructor(key: Buffer) {
    this.secretKey = key;
  }

  async embedWatermark(
    container: ImageProcessor,
    watermark: Buffer,
  ): Promise<ImageProcessor> {
    const containerBuffer = container.getPixelBuffer();
    const watermarkBuffer = watermark;

    for (let i = 0; i < watermarkBuffer.length; i++) {
      const watermarkByte = watermarkBuffer[i];
      const keyByte = this.secretKey[i % this.secretKey.length];

      const mixedByte = watermarkByte ^ keyByte;

      for (let bit = 0; bit < 8; bit++) {
        const pixelIndex = i * 8 + bit;
        const bitValue = (mixedByte >> bit) & 1;
        if (pixelIndex + bit < containerBuffer.length) {
          containerBuffer[pixelIndex + bit] =
            (containerBuffer[pixelIndex + bit] & ~1) | bitValue;
        }
      }
    }
    return container;
  }

  extractWatermark(
    stegoImage: ImageProcessor,
    watermarkSize: number,
  ): Uint8Array {
    const stegoBuffer = stegoImage.getPixelBuffer();
    const extractedBuffer = Buffer.alloc(watermarkSize);

    for (let i = 0; i < watermarkSize; i++) {
      let mixedByte = 0;

      for (let bit = 0; bit < 8; bit++) {
        const pixelIndex = i * 8 + bit;

        if (pixelIndex < stegoBuffer.length) {
          const bitValue = stegoBuffer[pixelIndex + bit] & 1;
          mixedByte |= bitValue << bit;
        }
      }

      const keyByte = this.secretKey[i % this.secretKey.length];
      const originalByte = mixedByte ^ keyByte;
      extractedBuffer[i] = originalByte;
    }

    return extractedBuffer;
  }

  async embedWithAdaptation(
    container: ImageProcessor,
    watermark: Uint8Array,
    width: number,
    height: number,
  ): Promise<ImageProcessor> {
    const containerBuffer = container.getPixelBuffer();

    const maxGradient = 255 * 2;
    const step = 1;

    for (let i = 0; i < watermark.length; i++) {
      const x = i % width;
      const y = Math.floor(i / width);

      const gradient = calculateGradient(containerBuffer, width, height, x, y);

      const adaptationFactor = 1 + (gradient / maxGradient) * step;

      const bit = watermark[i] & 1;
      container[y * width + x] =
        (container[y * width + x] & ~1) | (bit * adaptationFactor);
    }

    return container;
  }

  extractWithAdaptation(
    stegoImage: ImageProcessor,
    width: number,
    watermarkSize: number,
  ): Uint8Array {
    const imageBuffer = stegoImage.getPixelBuffer();

    const extracted = new Uint8Array(watermarkSize);

    for (let i = 0; i < watermarkSize; i++) {
      const x = i % width;
      const y = Math.floor(i / width);

      extracted[i] = imageBuffer[y * width + x] & 1;
    }

    return extracted;
  }
}
