import { Get, Req, Controller } from '@nestjs/common';

import { Request } from 'express';

interface StatusResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Controller()
export class AppController {
  @Get()
  get(@Req() request: Request): StatusResponse {
    return {
      statusCode: 200,
      message:
        'Markhet Server is up and running 1.0.3 . All systems are operational. With New Admin.',
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };
  }
}
