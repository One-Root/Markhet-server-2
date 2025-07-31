import {
  isISO8601,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const IsValidISO8601 = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsValidIsISO8601',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === '' || isISO8601(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is invalid.`;
        },
      },
    });
  };
};
