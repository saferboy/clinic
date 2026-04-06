import { SetMetadata } from '@nestjs/common';

/**
 * Permissions decorator - Endpoint uchun kerakli ruxsatnomalarni belgilaydi
 *
 * @usage @Permissions('role:create', 'role:read')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
