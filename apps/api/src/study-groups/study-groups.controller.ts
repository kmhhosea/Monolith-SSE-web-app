import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/auth/auth.types';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { StudyGroupsService } from './study-groups.service';

@ApiTags('study-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('study-groups')
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get()
  list() {
    return this.studyGroupsService.list();
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStudyGroupDto) {
    return this.studyGroupsService.create(user.sub, dto);
  }

  @Post(':id/join')
  join(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studyGroupsService.join(id, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyGroupsService.findOne(id);
  }
}
