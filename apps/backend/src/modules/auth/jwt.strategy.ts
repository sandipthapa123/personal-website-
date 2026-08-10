import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

const tokenExtractor = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  (req) => req?.cookies?.access_token,
]);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: tokenExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-thapasandip-cms',
      passReqToCallback: true,
    });
  }

  /** Beyond signature/expiry (handled by Passport before this runs), confirms the session
   *  backing this token hasn't been revoked — required for logout/password-change/2FA-disable
   *  to actually take effect before the JWT's own expiry. */
  async validate(req: Request, payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    const rawToken = tokenExtractor(req);
    if (rawToken) {
      const session = await this.authService.verifySessionToken(rawToken);
      if (!session) {
        throw new UnauthorizedException('Session has been revoked or expired');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
