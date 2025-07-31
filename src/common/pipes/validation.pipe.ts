import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { PipeOptions } from '../interfaces/validation-pipe.interface';
import { formatException } from '../exceptions/format-exception.factory';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly whitelist: boolean;
  private readonly forbidNonWhitelisted: boolean;
  private readonly shouldTransform: boolean;
  private readonly skipMissingProperties: boolean;
  private readonly groups: string[];
  private readonly always: boolean;
  private readonly enableDebugMessages: boolean;
  private readonly validationError: string;

  constructor(options?: PipeOptions) {
    const {
      whitelist,
      forbidNonWhitelisted,
      shouldTransform,
      skipMissingProperties,
      groups,
      always,
      enableDebugMessages,
      validationError,
    } = options;

    this.whitelist = whitelist ?? false;
    this.forbidNonWhitelisted = forbidNonWhitelisted ?? false;
    this.shouldTransform = shouldTransform ?? false;
    this.skipMissingProperties = skipMissingProperties ?? false;
    this.groups = groups ?? [];
    this.always = always ?? false;
    this.enableDebugMessages = enableDebugMessages ?? false;
    this.validationError = validationError ?? 'strict';
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);

    const errors = await validate(object, {
      whitelist: this.whitelist,
      forbidNonWhitelisted: this.forbidNonWhitelisted,
      transform: this.shouldTransform,
      skipMissingProperties: this.skipMissingProperties,
      groups: this.groups,
      always: this.always,
      enableDebugMessages: this.enableDebugMessages,
      validationError: this.validationError,
    });

    if (errors.length > 0) {
      throw formatException(errors);
    }

    if (this.shouldTransform) return object;

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype);
  }
}
