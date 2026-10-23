import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export const DB_UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Validator chấp nhận cả UUID RFC 4122 chuẩn và các UUID trong PostgreSQL
 * (bao gồm các UUID dữ liệu mẫu seed data như 11111111-1111-1111-1111-111111111111, 2222..., aaaa...).
 */
export function IsDbUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDbUUID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (value === null || value === undefined || value === '') {
            return true;
          }
          return typeof value === 'string' && DB_UUID_REGEX.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} phải là UUID hợp lệ`;
        },
      },
    });
  };
}
