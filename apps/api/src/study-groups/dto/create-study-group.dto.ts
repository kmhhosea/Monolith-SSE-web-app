import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateStudyGroupDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  topic!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}
