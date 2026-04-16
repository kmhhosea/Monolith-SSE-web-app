import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
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
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

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
      this.logger.warn(`Socket connection rejected: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('notifications:join')
  joinPersonalRoom(@ConnectedSocket() client: Socket) {
    const user = client.data.user as AuthUser;
    if (user) {
      client.join(`user:${user.sub}`);
    }
  }

  @OnEvent('notification.created')
  handleNotificationCreated(event: { userId: string; notification: unknown }) {
    this.server.to(`user:${event.userId}`).emit('notification.created', event.notification);
  }
}
