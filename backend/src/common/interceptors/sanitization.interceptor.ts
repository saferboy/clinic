import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sanitizeString, stripHtmlTags } from '../decorators/is-sanitized.decorator';

/**
 * Sanitization Interceptor
 * 
 * Request body'dagi string'larni automatic sanitize qiladi
 * XSS attacklardan himoya
 */
@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (body) {
      request.body = this.sanitizeObject(body);
    }

    return next.handle().pipe(
      map((data) => {
        // Response'da ham sanitize qilish (ixtiyoriy)
        return data;
      }),
    );
  }

  /**
   * Object yoki array'dagi barcha string'larni sanitize qilish
   */
  private sanitizeObject(obj: any): any {
    if (!obj) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeValue(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Qiymatni sanitize qilish
   */
  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // XSS tag'larni tozalash
      return stripHtmlTags(value.trim());
    }
    return value;
  }
}
