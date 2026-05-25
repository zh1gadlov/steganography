import * as fs from 'fs';

export function stringToBinary(text: string): string[] {
  return text.split('').map((char) => {
    // Получаем код символа
    const code = char.charCodeAt(0);
    // Преобразуем в двоичное представление и дополняем до 8 бит
    return code.toString(2).padStart(8, '0');
  });
}

export function binaryToString(binaryString: string) {
  const bytes = binaryString.replace(/\s/g, '').match(/.{8}/g);

  if (!bytes) {
    throw new Error(
      'Некорректный формат двоичной строки: ожидается строка из 8‑битных блоков',
    );
  }

  return bytes
    .map((byte) => {
      const decimalValue = parseInt(byte, 2);
      return String.fromCharCode(decimalValue);
    })
    .join('');
}

export function saveEncodedText(outputPath: string, data: string) {
  fs.writeFileSync(outputPath, data);
}

export function getBufferFromLocalImage(path: string) {
  const buffer = fs.readFileSync(`datasets/${path}`);
  return buffer;
}

export function calculateGradient(
  image: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
): number {
  // Используем простое вычисление градиента
  const left = x > 0 ? image[y * width + x - 1] : image[y * width + x];
  const right = x < width - 1 ? image[y * width + x + 1] : image[y * width + x];
  const top = y > 0 ? image[(y - 1) * width + x] : image[y * width + x];
  const bottom =
    y < height - 1 ? image[(y + 1) * width + x] : image[y * width + x];

  const gradient = Math.abs(left - right) + Math.abs(top - bottom);
  return gradient;
}
