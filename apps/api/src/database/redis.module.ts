import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

const normalizeRedisUrl = (value: string | undefined) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return 'redis://localhost:6379';
  }

  const decodedValue = (() => {
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  })();

  const matchedUrl = decodedValue.match(/(rediss?:\/\/[^\s'"]+)/i)?.[1];
  if (!matchedUrl) {
    return rawValue;
  }

  if (decodedValue.includes('--tls') && matchedUrl.startsWith('redis://')) {
    return `rediss://${matchedUrl.slice('redis://'.length)}`;
  }

  return matchedUrl;
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Redis,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis(normalizeRedisUrl(configService.get<string>('app.redisUrl')))
    },
    RedisService
  ],
  exports: [RedisService]
})
export class RedisModule {}
