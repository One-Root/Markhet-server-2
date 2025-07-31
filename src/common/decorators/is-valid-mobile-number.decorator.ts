import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const IsValidMobileNumber = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsValidMobileNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;

          const cleanedValue = value.replace(/\D/g, '');

          if (cleanedValue.startsWith('91') && cleanedValue.length === 12) {
            return true;
          } else if (cleanedValue.length === 10) {
            return true;
          } else if (
            cleanedValue.length === 12 &&
            cleanedValue.startsWith('91')
          ) {
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid mobile number in one of the following formats : +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX.`;
        },
      },
    });
  };
};
