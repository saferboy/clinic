import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * HTTP xatolarini handle qiluvchi global filter
 * NestJS exceptionlarini proper formatda qaytaradi
 */
@Catch(
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Message olish (object yoki string bo'lishi mumkin)
    let message: string | string[];
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      message = exceptionResponse.message;
    } else {
      message = exception.message;
    }

    const responseBody: any = {
      message: message,
      error: exception.name.replace('Exception', ''),
      statusCode: status,
    };

    // Validation errors qo'shish (agar mavjud bo'lsa)
    if (typeof exceptionResponse === 'object' && exceptionResponse.errors) {
      responseBody.errors = exceptionResponse.errors;
    }

    response.status(status).json(responseBody);
  }
}
