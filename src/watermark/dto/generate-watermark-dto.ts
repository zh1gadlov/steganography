import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GenerateWatermarkDtoRequest {
  @IsOptional()
  @IsString()
  pathToImage?: string;

  @IsOptional()
  image?: Express.Multer.File;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  useLocalImage?: boolean;

  @IsOptional()
  @IsString()
  secret?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  withAdaptation?: boolean;
}
