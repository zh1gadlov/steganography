import { Body, Controller, Get, Post, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PrepareContainersService } from './prepare-containers.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { EncodeImageDtoRequest } from './dto/encode-image-dto';
import { DecodeImageDtoRequest } from './dto/decode-image-dto';

@Controller('prepare-containers')
export class PrepareContainersController {
  constructor(
    private readonly prepareContainersService: PrepareContainersService,
  ){}

  @Post('encode')
  @UseInterceptors(FileInterceptor('imageToEncode'))
  async encodeImage(
    @Body() params: EncodeImageDtoRequest,
    @UploadedFile() imageToEncode?: Express.Multer.File,
  ) {
    const { file, fileName } = await this.prepareContainersService.encodeImage({ ...params, imageToEncode });
    return new StreamableFile(file, {
        type: 'image/bmp',
        disposition: `attachment; filename="${fileName}"`,
      });
  }

  @Post('decode')
  @UseInterceptors(FileInterceptor('imageToDecode'))
  async decodeImage(
    @Body() params: DecodeImageDtoRequest,
    @UploadedFile() imageToDecode: Express.Multer.File,
  ) {
    return await this.prepareContainersService.decodeImage({ ...params, imageToDecode });
  }

  @Get('list-available-files')
  getAvailableImagesList(){
    return this.prepareContainersService.getAvailableImagesList();
  }

}
