import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtPayload } from '../../../common/interfaces/jwt.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  // @ts-ignore: Unreachable code error
  async handleRequest<TUser = JwtPayload>(
    err: Error,
    user: TUser | null,
    info: any,
  ): Promise<TUser> {
    if (err || !user) {
      const errorMessage = info?.message || 'invalid or expired token';
      const errorDetails = err
        ? `error : ${err.message}`
        : 'no further error details available.';

      throw new UnauthorizedException({
        message: 'authentication failed',
        error: `${errorMessage} ${errorDetails}`,
      });
    }

    return user;
  }
}
