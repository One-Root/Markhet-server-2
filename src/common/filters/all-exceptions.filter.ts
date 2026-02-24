import * as Plivo from 'plivo';

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';

import { QueryFailedError } from 'typeorm';

const PLIVO_WEBHOOK_PATHS = [
  '/calls/answer',
  '/calls/answer-callback',
  '/calls/end',
  '/calls/transfer',
  '/calls/recording',
  '/calls/dial-action',
  '/calls/dial-action-callback',
  '/calls/ivr',
];

function isPlivoWebhookRequest(path: string): boolean {
  return (
    PLIVO_WEBHOOK_PATHS.some((p) => path === p || path.startsWith(p + '/')) ||
    path.startsWith('/calls/caller-tune/') ||
    path.startsWith('/calls/conference/')
  );
}

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

    // Plivo webhooks must return XML; JSON causes "XML Parsing Error" (7011)
    if (isPlivoWebhookRequest(request.path)) {
      const plivoResponse = Plivo.Response();
      response.status(200).type('application/xml').send(plivoResponse.toXML());
      return;
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
