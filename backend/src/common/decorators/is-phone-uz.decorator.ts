import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Uzbekistan Phone Number Validator
 *
 * Formats:
 * - +998901234567
 * - +998 90 123 45 67
 * - 901234567
 * - 90 123 45 67
 */
@ValidatorConstraint({ async: false })
export class IsPhoneUzConstraint implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s\-]/g, '');

    // Check if it matches Uzbekistan phone format
    // +998 format or 998 format or local format
    // Uzbekistan numbers: 9 digits after country code (90 123 45 67)
    const regex = /^(\+998|998|8)?9[0-9]{8}$/;

    return regex.test(cleaned);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Invalid phone number format. Expected: +998901234567 or 901234567';
  }
}

/**
 * IsPhoneUz decorator
 * 
 * @param validationOptions
 */
export function IsPhoneUz(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneUzConstraint,
    });
  };
}
