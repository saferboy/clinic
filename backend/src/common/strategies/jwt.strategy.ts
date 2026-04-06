import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../modules/auth/auth.service';
import { JwtPayload } from '../../modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.log(`Validating token for user: ${payload.sub}, type: ${payload.type}`);

    // Token type tekshirish
    if (payload.type !== 'access') {
      this.logger.warn(`Invalid token type: ${payload.type}`);
      throw new UnauthorizedException('Token noto\'g\'ri turi');
    }

    // User validate qilish
    const user = await this.authService.validateUser(payload);

    if (!user) {
      this.logger.warn(`User not found for id: ${payload.sub}`);
      throw new UnauthorizedException('User topilmadi');
    }

    this.logger.log(`User validated: ${user.id}, role: ${user.role?.name}`);

    return {
      id: user.id,
      login: user.login,
      role_id: user.role_id,
      role: user.role,
    };
  }
}
