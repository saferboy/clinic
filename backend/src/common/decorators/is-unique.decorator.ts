import { registerDecorator, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
import { IsUniqueConstraint } from '../validators/is-unique.validator';

/**
 * IsUnique decorator
 *
 * Database'da unikal ekanligini tekshiradi
 *
 * @param tableName - Database jadval nomi (masalan: 'users', 'clients')
 * @param fieldName - Field nomi (masalan: 'login', 'email')
 * @param validationOptions
 *
 * @example
 * @IsUnique('users', 'login', { message: 'Login already exists' })
 * @IsUnique('users', 'email', { message: 'Email already exists' })
 */
export function IsUnique(
  tableName: string,
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, fieldName],
      validator: IsUniqueConstraint,
    });
  };
}
