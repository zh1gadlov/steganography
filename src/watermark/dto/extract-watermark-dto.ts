import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ExtractWatermarkDtoRequest {
  image: Express.Multer.File;

  @IsOptional()
  @IsString()
  secret?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  withAdaptation?: boolean;
}
