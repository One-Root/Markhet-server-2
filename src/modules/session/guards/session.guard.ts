import { Injectable, UnauthorizedException } from '@nestjs/common';

import { SessionService } from '../session.service';

@Injectable()
export class SessionGuard {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('authentication failed');
    }

    const sessions = await this.sessionService.findSessionsByUserId(user['id']);

    if (!sessions || sessions.length === 0) {
      throw new UnauthorizedException('no active sessions');
    }

    for (const session of sessions) {
      const expired = await this.sessionService.isSessionValid(session.id);

      if (expired) {
        await this.sessionService.deleteSession(session.id);

        throw new UnauthorizedException('session expired, please log in again');
      }
    }

    return true;
  }
}
