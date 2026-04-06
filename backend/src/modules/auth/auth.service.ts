import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: number;
  login: string;
  role_id?: number;
  role_name?: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login - Autentifikatsiya
   */
  async login(loginDto: LoginDto) {
    // 1. User topish (login yoki email orqali)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { login: loginDto.login },
          { email: loginDto.login },
        ],
        deleted_at: null,
      },
      include: {
        role: {
          select: { id: true, name: true, permissions: true },
        },
      },
    });

    // Xavfsizlik: Login yoki parol noto'g'ri bo'lsa, bir xil xabar beramiz
    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Login yoki parol noto\'g\'ri',
      });
    }

    // 2. Status tekshirish
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'AUTH_002',
        message: 'Foydalanuvchi bloklangan yoki faol emas',
      });
    }

    // 3. Password tekshirish
    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Login yoki parol noto\'g\'ri',
      });
    }

    // 4. JWT Access Token yaratish
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-access-secret';
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        login: user.login,
        role_id: user.role_id,
        role_name: user.role?.name,
        type: 'access',
      },
      { secret: accessSecret, expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m' },
    );

    // 5. JWT Refresh Token yaratish
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      { secret: refreshSecret, expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d' },
    );

    // 6. Password response dan olib tashlash
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Muvaffaqiyatli kirish',
      data: {
        user: {
          id: userWithoutPassword.id,
          full_name: userWithoutPassword.full_name,
          login: userWithoutPassword.login,
          email: userWithoutPassword.email,
          phone: userWithoutPassword.phone,
          role: userWithoutPassword.role,
        },
        accessToken,
        refreshToken,
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Refresh Token - Access token yangilash
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    // 1. Refresh token validate qilish
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshTokenDto.refreshToken, {
        secret: refreshSecret,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'AUTH_004',
          message: 'Token amal qilish muddati tugagan',
        });
      }
      throw new UnauthorizedException({
        code: 'AUTH_008',
        message: 'Token noto\'g\'ri yoki amal qilmaydi',
      });
    }

    // 2. Token type tekshirish
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({
        code: 'AUTH_003',
        message: 'Noto\'g\'ri token turi',
      });
    }

    // 3. User mavjudligini va active ekanligini tekshirish
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.deleted_at || user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'AUTH_002',
        message: 'Foydalanuvchi bloklangan yoki faol emas',
      });
    }

    // 4. Yangi access token yaratish
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-access-secret';
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        login: user.login,
        role_id: user.role_id,
        role_name: user.role?.name,
        type: 'access',
      },
      { secret: accessSecret, expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m' },
    );

    // 5. Yangi refresh token yaratish
    const newRefreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      { secret: refreshSecret, expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d' },
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Logout - Tokenlarni bekor qilish
   */
  async logout(userId?: number) {
    // Hozircha oddiy logout - kelajakda Redis blacklist qo'shiladi
    // userId kelsa, kelajakda shu user uchun tokenlarni blacklist ga qo'shamiz
    return {
      success: true,
      message: 'Muvaffaqiyatli chiqish',
    };
  }

  /**
   * Change Password - Parolni o'zgartirish
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // 1. User topish
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deleted_at) {
      throw new NotFoundException({
        code: 'AUTH_005',
        message: 'Foydalanuvchi topilmadi',
      });
    }

    // 2. Eski password tekshirish
    const isValid = await bcrypt.compare(changePasswordDto.old_password, user.password);
    if (!isValid) {
      throw new BadRequestException({
        code: 'AUTH_006',
        message: 'Eski parol noto\'g\'ri',
      });
    }

    // 3. Yangi password strength tekshirish
    const strength = this.validatePasswordStrength(changePasswordDto.new_password);
    if (!strength.valid) {
      throw new BadRequestException({
        code: 'AUTH_007',
        message: 'Yangi parol juda zaif',
        errors: strength.errors,
      });
    }

    // 4. Yangi password hash va saqlash
    const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Parol muvaffaqiyatli o\'zgartirildi',
    };
  }

  /**
   * Get Current User (Me)
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: { id: true, name: true, permissions: true },
        },
      },
    });

    if (!user || user.deleted_at) {
      throw new NotFoundException({
        code: 'AUTH_005',
        message: 'Foydalanuvchi topilmadi',
      });
    }

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: userWithoutPassword,
    };
  }

  /**
   * Password strength validator
   */
  private validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Parol kamida 8 belgi bo\'lishi kerak');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Kamida 1 ta katta harf bo\'lishi kerak');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Kamida 1 ta kichik harf bo\'lishi kerak');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Kamida 1 ta raqam bo\'lishi kerak');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Kamida 1 ta maxsus belgi bo\'lishi kerak');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.deleted_at || user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'AUTH_002',
        message: 'Foydalanuvchi bloklangan yoki faol emas',
      });
    }

    const { password, ...result } = user;
    return result;
  }
}
