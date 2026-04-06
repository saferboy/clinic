import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Prisma xatolarini handle qiluvchi global filter
 * Database xatolarini proper HTTP response ga o'giradi
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(`Prisma error: ${exception.code} - ${exception.message}`);

    const errorResponse = this.formatPrismaError(exception);

    // Check if response has already been sent
    if (response.headersSent) {
      this.logger.warn('Response headers already sent, skipping...');
      return;
    }

    response.status(errorResponse.status).json({
      message: errorResponse.message,
      error: errorResponse.code,
      statusCode: errorResponse.status,
    });
  }

  private formatPrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    code: string;
    message: string;
  } {
    // P2021 - Jadval mavjud emas (database migration qilinmagan)
    if (error.code === 'P2021') {
      return {
        status: HttpStatus.BAD_GATEWAY,
        code: 'DB_NOT_READY',
        message: 'Database hali tayyor emas. Migration ishga tushiring.',
      };
    }

    // P2002 - Unique constraint failed (ikki xil xato: connection va unique violation)
    if (error.code === 'P2002') {
      // Meta ma'lumotdan constraint nomini aniqlash
      const meta = error.meta as {
        target?: string[];
        modelName?: string;
        driverAdapterError?: {
          cause?: {
            constraint?: {
              fields?: string[];
            };
          };
        };
      };

      // Field nomini olish (turli formatlarni support qilish)
      let field: string | undefined;

      // driverAdapterError.cause.constraint.fields orqali olish
      if (meta?.driverAdapterError?.cause?.constraint?.fields) {
        field = meta.driverAdapterError.cause.constraint.fields[0];
      } else if (meta?.target && meta.target.length > 0) {
        field = meta.target[0];
      }

      if (field) {
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'UNIQUE_CONSTRAINT_ERROR',
          message: `${this.formatFieldName(field)} allaqachon mavjud.`,
        };
      }

      // Agar field topilmasa - bu connection error
      return {
        status: HttpStatus.BAD_GATEWAY,
        code: 'DB_CONNECTION_ERROR',
        message: 'Database bilan bog\'lanishda xatolik.',
      };
    }

    // P2003 - Foreign key constraint failed
    if (error.code === 'P2003') {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'DB_CONSTRAINT_ERROR',
        message: 'Ma\'lumotlarni o\'zgartirishda xatolik (foreign key).',
      };
    }

    // P2025 - Record not found
    if (error.code === 'P2025') {
      return {
        status: HttpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
        message: 'So\'ralgan ma\'lumot topilmadi.',
      };
    }

    // P2000 - Value too long
    if (error.code === 'P2000') {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'Maydon qiymati juda uzun.',
      };
    }

    // P2006 - Invalid value type
    if (error.code === 'P2006') {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'INVALID_TYPE',
        message: 'Noto\'g\'ri ma\'lumot turi.',
      };
    }

    // Default - Boshqa Prisma xatolari
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'DATABASE_ERROR',
      message: 'Database xatosi yuz berdi.',
    };
  }

  /**
   * Field nomini chiroyli formatga keltirish
   * Example: "name" -> "Name", "client_id" -> "Client ID"
   */
  private formatFieldName(field: string): string {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
