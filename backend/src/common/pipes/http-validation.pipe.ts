import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Enhanced Validation Pipe with better error messages
 */
@Injectable()
export class HttpValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(errors);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
      ...options,
    });
  }

  /**
   * Format validation errors into a readable format
   */
  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    const extractErrors = (error: ValidationError) => {
      if (error.constraints) {
        const messages = Object.values(error.constraints);
        if (formattedErrors[error.property]) {
          formattedErrors[error.property].push(...messages);
        } else {
          formattedErrors[error.property] = messages;
        }
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => extractErrors(child));
      }
    };

    errors.forEach((error) => extractErrors(error));

    return formattedErrors;
  }
}

/**
 * Unique Validation Pipe - works with PrismaService
 */
@Injectable()
export class UniqueValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // This pipe works in conjunction with @IsUnique decorator
    // Actual validation happens in the validator constraint
    return value;
  }
}
