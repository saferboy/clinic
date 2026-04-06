import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = ICurrentUser>(
    err: any,
    user: TUser | null,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token noto\'g\'ri yoki amal qilmaydi');
    }

    // User ma'lumotlarini request ga qo'shish
    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user;
  }
}
