import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDirectConversationDto {
  @ApiProperty()
  @IsString()
  peerId!: string;
}
