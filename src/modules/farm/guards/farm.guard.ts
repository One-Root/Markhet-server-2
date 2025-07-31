import { Injectable, UnauthorizedException } from '@nestjs/common';

import { FarmService } from '../farm.service';

@Injectable()
export class FarmGuard {
  constructor(private readonly farmService: FarmService) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('authentication failed');
    }

    const { farmId } = request.params;

    if (!farmId) {
      throw new UnauthorizedException('no farm id provided');
    }

    const farm = await this.farmService.findOne(farmId);

    if (!farm) {
      throw new UnauthorizedException(`farm with id ${farmId} not found`);
    }

    if (farm.user.id !== user['id']) {
      throw new UnauthorizedException(
        `farm with id ${farmId} does not belong to the current user`,
      );
    }

    return true;
  }
}
