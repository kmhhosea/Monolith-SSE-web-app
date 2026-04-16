import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('app.googleClientId') ?? '',
      clientSecret: configService.get<string>('app.googleClientSecret') ?? '',
      callbackURL: configService.get<string>('app.googleCallbackUrl'),
      scope: ['email', 'profile']
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const [primaryEmail] = profile.emails ?? [];
    return {
      email: primaryEmail?.value,
      fullName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      googleId: profile.id
    };
  }
}
