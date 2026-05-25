import * as fs from "fs";
import { Buffer } from "buffer";

export class ImageProcessor {
  width: number = 0;
  height: number = 0;
  private bitsPerPixel: number = 0;
  private imageData: Uint8Array;

  constructor() {
    this.imageData = new Uint8Array(0);
  }

  getImageDimensions(): { width: number; height: number, bitsPerPixel: number } {
    return { width: this.width, height: this.height, bitsPerPixel: this.bitsPerPixel };
  }

  private parseBMPHeader(buffer: Buffer): {
    width: number;
    height: number;
    bitsPerPixel: number;
    dataOffset: number;
  } {
    // Проверяем сигнатуру файла
    const signature = buffer.readUInt16LE(0);
    if (signature !== 0x4d42) {
      throw new Error("Неверный формат файла (ожидается BMP)");
    }

    const headerSize = buffer.readInt32LE(14);
    if (headerSize !== 40) {
      throw new Error("Неподдерживаемый размер информационного заголовка");
    }

    return {
      width: buffer.readInt32LE(18),
      height: buffer.readInt32LE(22),
      bitsPerPixel: buffer.readInt16LE(28),
      dataOffset: buffer.readInt32LE(10),
    };
  }

  async loadImage(buffer: Buffer): Promise<void> {

    // Парсим заголовок BMP
    const header = this.parseBMPHeader(buffer);

    // Сохраняем параметры изображения
    this.width = header.width;
    this.height = header.height;
    this.bitsPerPixel = header.bitsPerPixel;

    // Добавляем логирование глубины цвета
    console.log(`Глубина цвета изображения: ${this.bitsPerPixel} бит`);

    // Извлекаем данные пикселей
    this.imageData = buffer.slice(header.dataOffset);
  }

  extractBitplane(bitPosition: number): number[][] {
    const bitplane: number[][] = Array(this.height)
      .fill(0)
      .map(() => Array(this.width).fill(0));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const pixelValue = this.imageData[idx]; // Значение пикселя (0–255)
        // Извлекаем k‑й бит
        const bitValue = (pixelValue >> bitPosition) & 1;
        bitplane[y][x] = bitValue;
      }
    }
    return bitplane;
  }

  extractBitplane24bit(bitPosition: number): number[][] {
  const bitplane: number[][] = Array(this.height)
    .fill(0)
    .map(() => Array(this.width).fill(0));

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      // Вычисляем начальный индекс пикселя (каждый пиксель — 3 байта)
      const pixelIndex = (y * this.width + x) * 3;

      // Получаем значения RGB для пикселя
      const r = this.imageData[pixelIndex];
      const g = this.imageData[pixelIndex + 1];
      const b = this.imageData[pixelIndex + 2];

      // Извлекаем бит из каждого канала (если bitPosition в диапазоне 0–7)
      let bitValue = 0;
      if (bitPosition >= 0 && bitPosition <= 7) {
        bitValue = ((r >> bitPosition) & 1) |
                  ((g >> bitPosition) & 1) |
                  ((b >> bitPosition) & 1);
      }
      // Если bitPosition > 7, устанавливаем 0 (вне диапазона 8‑битных каналов)

      bitplane[y][x] = bitValue;
    }
  }
  return bitplane;
}
}
