import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Unique Validator - Database'da unikal ekanligini tekshiradi
 *
 * Usage: @IsUnique(['users', 'login'])
 */
@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Optional fields uchun
    }

    const [tableName, fieldName] = args.constraints;

    if (!tableName || !fieldName) {
      return false;
    }

    try {
      // Dynamic query - Prisma model access
      const model = (this.prisma as any)[tableName];
      if (!model) {
        return true; // Agar model topilmasa, validation o'tkazamiz
      }

      // Exclude current record (update paytida o'zini ignore qilish uchun)
      const excludeId = (args.object as any).id;

      const existing = await model.findFirst({
        where: {
          [fieldName]: value,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
          deleted_at: null, // Soft delete qilinganlarni hisobga olmaslik
        },
      });

      return !existing; // Agar topilmasa - true (valid)
    } catch (error) {
      console.error(`IsUniqueConstraint error: ${error.message}`);
      return true; // Error bo'lsa validation o'tkazamiz
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [tableName, fieldName] = args.constraints;
    return `${fieldName} already exists`;
  }
}
