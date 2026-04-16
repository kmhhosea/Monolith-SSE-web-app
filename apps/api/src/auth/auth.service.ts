import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User, RefreshToken } from 'src/database/entities';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './auth.types';
import { REFRESH_COOKIE_NAME } from './auth.constants';

type SessionResult = {
  accessToken: string;
  user: User;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto, response: Response): Promise<SessionResult> {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userRepository.save(
      this.userRepository.create({
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        university: dto.university,
        course: dto.course,
        skills: dto.skills ?? [],
        interests: dto.interests ?? [],
        goals: dto.goals ?? []
      })
    );

    return this.issueSession(user, response);
  }

  async login(email: string, password: string, response: Response): Promise<SessionResult> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        avatarUrl: true,
        bio: true,
        university: true,
        course: true,
        country: true,
        skills: true,
        interests: true,
        goals: true,
        role: true,
        googleId: true,
        timezone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueSession(user, response);
  }

  async refresh(refreshToken: string | undefined, response: Response): Promise<SessionResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    const activeTokens = await this.refreshTokenRepository.find({
      where: { revoked: false },
      relations: { user: true }
    });

    const matchedToken = await this.findMatchingRefreshToken(activeTokens, refreshToken);
    if (!matchedToken || matchedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    matchedToken.revoked = true;
    await this.refreshTokenRepository.save(matchedToken);

    return this.issueSession(matchedToken.user, response);
  }

  async logout(refreshToken: string | undefined, response: Response): Promise<void> {
    if (refreshToken) {
      const tokens = await this.refreshTokenRepository.find({
        where: { revoked: false }
      });
      const matchedToken = await this.findMatchingRefreshToken(tokens, refreshToken);
      if (matchedToken) {
        matchedToken.revoked = true;
        await this.refreshTokenRepository.save(matchedToken);
      }
    }

    response.clearCookie(REFRESH_COOKIE_NAME, this.cookieOptions());
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }

  async findOrCreateGoogleUser(profile: {
    email?: string;
    fullName?: string;
    avatarUrl?: string | null;
    googleId?: string;
  }): Promise<User> {
    if (!profile.email || !profile.googleId) {
      throw new UnauthorizedException('Google profile is incomplete.');
    }

    const existing = await this.userRepository.findOne({ where: { email: profile.email } });
    if (existing) {
      existing.googleId = profile.googleId;
      existing.avatarUrl = existing.avatarUrl ?? profile.avatarUrl ?? null;
      return this.userRepository.save(existing);
    }

    return this.userRepository.save(
      this.userRepository.create({
        email: profile.email,
        fullName: profile.fullName ?? 'SSE Student',
        avatarUrl: profile.avatarUrl ?? null,
        googleId: profile.googleId,
        university: 'SSE Network',
        course: 'Undeclared',
        skills: [],
        interests: [],
        goals: []
      })
    );
  }

  async issueSession(user: User, response: Response): Promise<SessionResult> {
    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.accessSecret'),
      expiresIn: this.configService.get<string>('app.accessTtl')
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.refreshSecret'),
      expiresIn: this.configService.get<string>('app.refreshTtl')
    });

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + this.parseTtlToMs(this.configService.get<string>('app.refreshTtl'))),
        revoked: false
      })
    );

    response.cookie(REFRESH_COOKIE_NAME, refreshToken, this.cookieOptions());

    return {
      accessToken,
      user
    };
  }

  private async findMatchingRefreshToken(
    tokens: RefreshToken[],
    rawToken: string
  ): Promise<RefreshToken | null> {
    for (const token of tokens) {
      const matches = await argon2.verify(token.tokenHash, rawToken);
      if (matches) {
        return token;
      }
    }

    return null;
  }

  private parseTtlToMs(ttl = '7d'): number {
    const value = Number.parseInt(ttl.slice(0, -1), 10);
    const unit = ttl.at(-1);

    if (!Number.isFinite(value) || !unit) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const multipliers: Record<string, number> = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] ?? 24 * 60 * 60 * 1000);
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.configService.get<string>('app.nodeEnv') === 'production',
      path: '/'
    };
  }
}
