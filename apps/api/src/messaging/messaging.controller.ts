import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/auth/auth.types';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  listConversations(@CurrentUser() user: AuthUser) {
    return this.messagingService.listConversations(user.sub);
  }

  @Post('conversations/direct')
  createDirectConversation(@CurrentUser() user: AuthUser, @Body() dto: CreateDirectConversationDto) {
    return this.messagingService.createDirectConversation(user.sub, dto.peerId);
  }

  @Get('conversations/:conversationId/messages')
  getMessages(@CurrentUser() user: AuthUser, @Param('conversationId') conversationId: string) {
    return this.messagingService.getMessages(conversationId, user.sub);
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto
  ) {
    return this.messagingService.sendMessage(conversationId, user.sub, dto);
  }

  @Post('conversations/:conversationId/read')
  markRead(@CurrentUser() user: AuthUser, @Param('conversationId') conversationId: string) {
    return this.messagingService.markConversationRead(conversationId, user.sub);
  }
}
