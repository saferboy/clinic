/**
 * Foydalanuvchi ma'lumotlari (Request.user uchun)
 */
export interface ICurrentUser {
  id: number;
  login: string;
  role_id?: number;
  role_name: string;
  role_permissions?: Record<string, unknown>;
}

/**
 * Request object with user
 */
export interface IRequestWithUser extends Request {
  user: ICurrentUser;
}
