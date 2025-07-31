import { ValidationError } from 'class-validator';

const formatError = (error: ValidationError): string => {
  let messages: string[] = [];

  if (error.constraints) {
    messages = Object.values(error.constraints).map((message) => {
      switch (message) {
        case 'isNotEmpty':
          return `${error.property} cannot be empty. please provide a value.`;
        case 'isString':
          return `${error.property} must be a valid text.`;
        case 'isEnum':
          return `${error.property} must be one of the allowed values.`;
        case 'isMobilePhone':
          return `${error.property} must be a valid phone number. please check the format.`;
        default:
          return `${error.property} contains an invalid value: ${message}. please review.`;
      }
    });
  }

  if (error.children && error.children.length > 0) {
    const msg = error.children.map(formatError);

    messages.push(msg.join('; '));
  }

  return messages.join('; ');
};

export const formatException = (errors: ValidationError[]) => {
  const messages = errors.map(formatError);

  return new Error(messages.join(' | '));
};
