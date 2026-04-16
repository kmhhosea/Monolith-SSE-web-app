import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Redis,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => new Redis(configService.get<string>('app.redisUrl') ?? 'redis://localhost:6379')
    },
    RedisService
  ],
  exports: [RedisService]
})
export class RedisModule {}
