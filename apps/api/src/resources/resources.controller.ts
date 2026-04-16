import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/auth/auth.types';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  list(@Query('q') query?: string) {
    return this.resourcesService.list(query);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'apps/api/uploads',
        filename: (_request, file, callback) => {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        }
      })
    })
  )
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateResourceDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.resourcesService.create(user.sub, dto, file);
  }
}
