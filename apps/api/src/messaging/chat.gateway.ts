import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthUser } from 'src/auth/auth.types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string | undefined;
      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: this.configService.get<string>('app.accessSecret')
      });

      client.data.user = user;
      client.join(`user:${user.sub}`);
    } catch (error) {
      this.logger.warn(`Chat socket rejected: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('conversation:join')
  joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string }
  ) {
    client.join(`conversation:${body.conversationId}`);
    return { joined: body.conversationId };
  }

  @SubscribeMessage('conversation:typing')
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string; isTyping: boolean }
  ) {
    const user = client.data.user as AuthUser;
    client.to(`conversation:${body.conversationId}`).emit('conversation:typing', {
      conversationId: body.conversationId,
      userId: user.sub,
      fullName: user.fullName,
      isTyping: body.isTyping
    });
  }

  @OnEvent('message.sent')
  onMessageSent(event: unknown) {
    const payload = event as { conversationId: string };
    this.server.to(`conversation:${payload.conversationId}`).emit('message.created', event);
  }

  @OnEvent('message.read')
  onMessageRead(event: unknown) {
    const payload = event as { conversationId: string };
    this.server.to(`conversation:${payload.conversationId}`).emit('message.read', event);
  }
}
