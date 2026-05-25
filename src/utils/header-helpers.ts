export function createBlackAndWhitePalette() {
  const palette = new Uint8Array(1024);

  palette[0] = 0xff; // Blue
  palette[1] = 0xff; // Green
  palette[2] = 0xff; // Red
  palette[3] = 0; // Reserved

  // Заполняем оставшиеся цвета чёрным
  for (let i = 1; i < 256; i++) {
    palette[i * 4 + 0] = 0x00;
    palette[i * 4 + 1] = 0x00;
    palette[i * 4 + 2] = 0x00;
    palette[i * 4 + 3] = 0x00;
  }

  return palette;
}

export function createGrayPalette() {
  const palette = new Uint8Array(1024); // 256 цветов × 4 байта

  for (let i = 0; i < 256; i++) {
    const value = i; // От 0 (чёрный) до 255 (белый)

    palette[i * 4 + 0] = value; // Blue
    palette[i * 4 + 1] = value; // Green
    palette[i * 4 + 2] = value; // Red
    palette[i * 4 + 3] = 0; // Reserved (запасной байт)
  }

  return palette;
}

export function createBmpHeader(width: number, height: number): Buffer {
  const header = Buffer.alloc(54);

  // BMP сигнатура
  header.writeUInt16LE(0x4d42, 0);

  // Размер файла: заголовок (54 байта) + данные изображения
  const fileSize = width * height;
  header.writeUInt32LE(fileSize, 2);

  // Резервные байты
  header.writeUInt32LE(0, 6);
  header.writeUInt32LE(14 + 40 + 1024, 10); // Смещение данных

  // Размер заголовка
  header.writeUInt32LE(40, 14);

  // Ширина и высота
  header.writeInt32LE(width, 18);
  header.writeInt32LE(height, 22);

  // Битов на пиксель
  header.writeUInt8(8, 28);

  // Битовая компрессия (0 - без сжатия)
  header.writeUInt32LE(0, 30);

  // Размер изображения в байтах
  header.writeUInt32LE(0, 34);

  return header;
}
