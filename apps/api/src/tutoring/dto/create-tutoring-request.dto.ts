import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTutoringRequestDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  topic!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  course!: string;
}
