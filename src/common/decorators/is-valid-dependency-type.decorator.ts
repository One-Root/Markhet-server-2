import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import { Dependency } from '../types/priority-config.type';
import { DependencyType } from '../enums/priority-config.enum';

export const IsValidDependencyValue = (
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsValidDependencyValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { object } = args;

          const { type } = object as Dependency;

          switch (type) {
            case DependencyType.STRING:
              return typeof value === 'string';

            case DependencyType.NUMBER:
              return typeof value === 'number';

            case DependencyType.BOOLEAN:
              return typeof value === 'boolean';

            case DependencyType.DATE:
              return value instanceof Date || !isNaN(Date.parse(value));

            case DependencyType.ARRAY_STRING:
              return (
                Array.isArray(value) &&
                value.every((item) => typeof item === 'string')
              );

            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is invalid for the given dependency type : ${args.object['type']}.`;
        },
      },
    });
  };
};
