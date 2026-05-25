import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class EncodeImageDtoRequest {
  @IsOptional()
  @IsString()
  text?: string;

  @IsNumber()
  bitplaneNumber: number;

  @IsOptional()
  imageToEncode?: Express.Multer.File;

  @IsOptional()
  @IsString()
  pathToImage?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  useLocalImage?: boolean;
}
