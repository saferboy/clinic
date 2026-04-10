import { Controller, Post, Get, Put, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

interface RequestWithUser {
  user: ICurrentUser;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login - Autentifikatsiya' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish' })
  @ApiResponse({ status: 401, description: 'Login yoki parol noto\'g\'ri!' })
  @ApiResponse({ status: 403, description: 'Account blokirovka qilingan' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Token - Access token yangilash' })
  @ApiResponse({ status: 200, description: 'Token yangilandi' })
  @ApiResponse({ status: 401, description: 'Token amal qilmaydi' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout - Chiqish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqish' })
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.authService.logout(0);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change Password - Parolni o\'zgartirish' })
  @ApiResponse({ status: 200, description: 'Parol o\'zgartirildi' })
  @ApiResponse({ status: 400, description: 'Eski parol noto\'g\'ri yoki yangi parol zaif' })
  async changePassword(@Request() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current User - O\'z profilini olish' })
  @ApiResponse({ status: 200, description: 'Profil ma\'lumotlari' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
  async getProfile(@Request() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Profile - Profil ma\'lumotlarini yangilash' })
  @ApiResponse({ status: 200, description: 'Profil yangilandi' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri ma\'lumotlar' })
  async updateProfile(@Request() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }
}
