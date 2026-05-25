import * as fs from "fs";
import { createBlackAndWhitePalette, createBmpHeader, createGrayPalette } from "./header-helpers";
import { FISH_TEXT } from "datasets/fish";

export function stringToBinary(text: string): string[] {
  return text.split('').map(char => {
    // Получаем код символа
    const code = char.charCodeAt(0);
    // Преобразуем в двоичное представление и дополняем до 8 бит
    return code.toString(2).padStart(8, '0');
  });
}

export function binaryToString(binaryString: string) {
  const bytes = binaryString.replace(/\s/g, '').match(/.{8}/g);

  if (!bytes) {
    throw new Error('Некорректный формат двоичной строки: ожидается строка из 8‑битных блоков');
  }

  return bytes.map(byte => {
    const decimalValue = parseInt(byte, 2);
    return String.fromCharCode(decimalValue);
  }).join('');
}

export function saveEncodedText(outputPath: string, data: string){
  fs.writeFileSync(outputPath, data)
}