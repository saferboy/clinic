import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * XSS Sanitization Validator
 * 
 * HTML/XSS attacklaridan tozalash uchun
 */
@ValidatorConstraint({ async: false })
export class IsSanitizedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'string') {
      return true;
    }

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<svg[^>]*onload/gi,
      /<img[^>]*onerror/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Input contains potentially dangerous content (XSS)';
  }
}

/**
 * IsSanitized decorator
 * 
 * @param validationOptions
 */
export function IsSanitized(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSanitizedConstraint,
    });
  };
}

/**
 * Sanitize string - XSS attacklaridan tozalash
 * 
 * @param value - Tozalanishi kerak bo'lgan string
 * @returns Tozalangan string
 */
export function sanitizeString(value: string): string {
  if (!value) {
    return value;
  }

  // HTML entities encode qilish
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip HTML tags - barcha HTML tag'larni olib tashlash
 * 
 * @param value - HTML tag'lar bilan string
 * @returns HTML tagsiz string
 */
export function stripHtmlTags(value: string): string {
  if (!value) {
    return value;
  }

  return value.replace(/<[^>]*>/g, '');
}
