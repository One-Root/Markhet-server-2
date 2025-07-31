import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';

import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal server error';
    let error = 'Unknown error';

    // handle TypeORM (PostgreSQL)
    if (exception instanceof QueryFailedError) {
      status = 400;
      message = 'Database query failed';
      error = exception.message;
    }
    // handle HTTP exceptions like BadRequestException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    // handle general JavaScript Errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
    }

    // construct and send the error response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
