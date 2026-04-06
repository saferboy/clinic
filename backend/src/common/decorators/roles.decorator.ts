import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator - Faqat ma'lum rolli foydalanuvchilar uchun
 * @param roles - Ruxsat etilgan rollar (ADMIN, DOCTOR, NURSE, etc.)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
