import { IsNumber, IsOptional } from "class-validator";

export class DecodeImageDtoRequest {
  @IsNumber()
  bitplaneNumber: number;

  imageToDecode: Express.Multer.File;
}