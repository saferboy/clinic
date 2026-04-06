import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard - Faqat ma'lum rolli foydalanuvchilar kirishini ta'minlaydi
 * JwtAuthGuard dan keyin ishlatiladi, shuning uchun request.user allaqachon mavjud
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Agar JwtAuthGuard user ma'lumotlarini set qilmagan bo'lsa
    if (!user) {
      throw new ForbiddenException('Token talab qilinadi');
    }

    // 1. Permission-based tekshirish (SuperAdmin uchun - "all" permission)
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (requiredPermissions && requiredPermissions.length > 0) {
      // User ma'lumotlarini to'liq olish (role permissions bilan)
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (!dbUser || dbUser.deleted_at || dbUser.status !== 'ACTIVE') {
        throw new ForbiddenException('Foydalanuvchi topilmadi yoki faol emas');
      }

      if (!dbUser.role) {
        throw new ForbiddenException('Foydalanuvchining roli yo\'q');
      }

      const rolePermissions = dbUser.role.permissions as any;

      // "all" permission tekshirish (SuperAdmin uchun)
      if (rolePermissions?.all === true) {
        return true;
      }

      // OR logikasi: Kamida bitta permission kifoya
      for (const permission of requiredPermissions) {
        const [resource, action] = permission.split(':');

        if (rolePermissions?.[resource]?.[action]) {
          return true; // Kamida bitta permission topildi - ruxsat berish
        }
      }

      // Hech bir permission topilmadi
      throw new ForbiddenException(`Ruxsat yo'q: ${requiredPermissions.join(' yoki ')}`);
    }

    // 2. Role-based tekshirish (@Roles decorator)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      // Role nomi bilan tekshirish (user.role - bu obyekt)
      const userRoleName = typeof user.role === 'string' ? user.role : user.role?.name;
      
      if (!requiredRoles.includes(userRoleName)) {
        throw new ForbiddenException(
          `Ruxsat yo'q. Talab qilinadigan rollar: ${requiredRoles.join(', ')}`,
        );
      }
      return true;
    }

    // Agar na roles na permissions talab qilinmasa, ruxsat berish
    return true;
  }
}
