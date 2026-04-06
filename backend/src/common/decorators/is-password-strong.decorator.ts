import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Password Strength Validator
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
@ValidatorConstraint({ async: false })
export class IsPasswordStrongConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
  }
}

/**
 * IsPasswordStrong decorator
 * 
 * @param validationOptions
 */
export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordStrongConstraint,
    });
  };
}
