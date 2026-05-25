import { Injectable } from '@nestjs/common';
import { mkdirSync, readdirSync, readFileSync } from 'fs';
import { EncodeImageDtoRequest } from './dto/encode-image-dto';
import { ImageProcessor } from './image-processor-service';
import { createBitplaneImage, createCombinedImage, extractTextFromBitplane, replaceBitplaneToText } from './utils/bitplanes-helper';
import { v4 } from 'uuid';
import { DecodeImageDtoRequest } from './dto/decode-image-dto';

@Injectable()
export class PrepareContainersService {
  getBufferFromLocalImage(path: string){
    const buffer = readFileSync(`datasets/${path}`);
    return buffer;
  }

  getAvailableImagesList(){
    const availableFiles = readdirSync('datasets', { recursive: true });
    return { data: availableFiles.filter((filename) => filename.includes('.bmp'))}
  }

  async encodeImage(params: EncodeImageDtoRequest){
    const imageBuffer = params.useLocalImage && params.pathToImage ? this.getBufferFromLocalImage(params.pathToImage) : params.imageToEncode?.buffer;
    const processor = new ImageProcessor();
    if (!imageBuffer){
      throw new Error('Не удалось прочитать изображение')
    }
    processor.loadImage(imageBuffer)
    const imageUUID = v4()
    const { width, height, bitsPerPixel } = processor.getImageDimensions();
    const allBitplanes: number[][][] = [];

    mkdirSync(`images/${imageUUID}`)
    for (let k = 0; k <= 7; k++) {
      const bitplane = bitsPerPixel == 8 ? processor.extractBitplane(k) : processor.extractBitplane24bit(k);

      allBitplanes.push(bitplane);

      const outputPath = `images/${imageUUID}/bitplane_k${k}.bmp`;
      await createBitplaneImage(width, height, bitplane, outputPath);
    }

    const combinedPath = `images/${imageUUID}/combined_image.bmp`
    const modBitplanes = replaceBitplaneToText(allBitplanes, params.bitplaneNumber, width, height, params.text);
    const combinedImage = await createCombinedImage(width, height, modBitplanes, combinedPath);

    return { file: combinedImage, fileName: `${imageUUID}.bmp`};
  }

  async decodeImage(params: DecodeImageDtoRequest){
    const processor = new ImageProcessor();
    await processor.loadImage(params.imageToDecode.buffer);
    const { width, height } = processor.getImageDimensions();
    const bitplane = processor.extractBitplane(params.bitplaneNumber);
    const text = extractTextFromBitplane(bitplane, width, height)
    return text;
  }
}


