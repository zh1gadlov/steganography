import { writeFileSync } from 'fs';
import {
  createBlackAndWhitePalette,
  createBmpHeader,
  createGrayPalette,
} from './header-helpers';
import { FISH_TEXT } from 'datasets/fish';
import { binaryToString, stringToBinary } from './utils';

export async function createBitplaneImage(
  width: number,
  height: number,
  bitplane: number[][],
  outputPath: string,
): Promise<void> {
  // Проверяем корректность входных данных
  if (bitplane.length !== height) {
    throw new Error('Неверное количество строк в битовом слое');
  }
  if (bitplane[0].length !== width) {
    throw new Error('Неверное количество столбцов в битовом слое');
  }

  const rowSize = width;
  const padding = (4 - (rowSize % 4)) % 4;
  const totalRowSize = rowSize + padding;
  const totalSize = totalRowSize * height;
  const buffer = Buffer.alloc(totalSize + 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bitValue = bitplane[y][x];

      if (bitValue !== 0 && bitValue !== 1) {
        throw new Error(`Некорректное значение бита в позиции (${x},${y})`);
      }

      const pixelValue = bitValue === 1 ? 0x1 : 0x0;
      const pixelIndex = rowSize * y + x;

      buffer.writeUInt8(pixelValue, pixelIndex);
    }
  }

  // Создаем заголовок BMP
  const bmpHeader = createBmpHeader(width, height);
  const palette = createBlackAndWhitePalette();

  // Сохраняем файл
  try {
    writeFileSync(outputPath, Buffer.concat([bmpHeader, palette, buffer]));
    console.log(`Файл сохранен: ${outputPath}`);
  } catch (error) {
    throw new Error(`Ошибка при сохранении файла: ${error}`);
  }
}

export async function createCombinedImage(
  width: number,
  height: number,
  bitplanes: number[][][],
  combinedPath: string,
): Promise<Buffer> {
  const bytesPerPixel = 1; // 8-битный BMP
  const rowSize = width * bytesPerPixel;
  const padding = (4 - (rowSize % 4)) % 4;
  const totalRowSize = rowSize + padding;
  const numBits = bitplanes.length;
  const totalSize = totalRowSize * height;
  const buffer = Buffer.alloc(totalSize);

  for (let y = 0; y < height; y++) {
    const rowStart = y * totalRowSize;

    for (let x = 0; x < width; x++) {
      const binaryString: string[] = [];
      for (let bit = 0; bit < numBits; bit++) {
        binaryString.push(`${bitplanes[bit][y][x]}`);
      }
      const pixelValue = parseInt(binaryString.reverse().join(''), 2);
      const pixelIndex = rowStart + x * bytesPerPixel;
      buffer.writeUInt8(pixelValue, pixelIndex);
    }
  }

  // Создаем заголовок BMP
  const bmpHeader = createBmpHeader(width, height);
  const palette = createGrayPalette();

  const file = Buffer.concat([bmpHeader, palette, buffer]);
  // Сохраняем файл
  writeFileSync(combinedPath, file);
  console.log(`Полноцветное изображение сохранено: ${combinedPath}`);

  return file;
}

export function replaceBitplaneToText(
  bitplanes: number[][][],
  bitplaneIndex: number,
  height: number,
  width: number,
  text: string = FISH_TEXT,
) {
  const charsArray = stringToBinary(text);
  const bitArray = charsArray.join('').split('');

  for (let y = 0; y < height; y++) {
    const rowStart = y * height;

    for (let x = 0; x < width; x++) {
      const i = Number.parseInt(bitArray[rowStart + x]);
      bitplanes[bitplaneIndex][x][y] = i ? i : 0;
    }
  }

  return bitplanes;
}

export function extractTextFromBitplane(
  bitplane: number[][],
  height: number,
  width: number,
) {
  const binaryText: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      binaryText.push(bitplane[x][y]);
    }
  }
  return binaryToString(binaryText.join(''));
}
