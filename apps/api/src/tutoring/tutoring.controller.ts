import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/auth/auth.types';
import { CreateTutoringRequestDto } from './dto/create-tutoring-request.dto';
import { TutoringService } from './tutoring.service';

@ApiTags('tutoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutoring')
export class TutoringController {
  constructor(private readonly tutoringService: TutoringService) {}

  @Get('requests')
  list() {
    return this.tutoringService.list();
  }

  @Post('requests')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTutoringRequestDto) {
    return this.tutoringService.create(user.sub, dto);
  }

  @Post('requests/:id/claim')
  claim(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tutoringService.claim(id, user.sub);
  }

  @Post('requests/:id/close')
  close(
    @Param('id') id: string,
    @Body('rating') rating?: number,
    @Body('feedback') feedback?: string
  ) {
    return this.tutoringService.close(id, rating, feedback);
  }
}
