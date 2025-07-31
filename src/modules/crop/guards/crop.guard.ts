import {
  Type,
  Injectable,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';

import { CropService } from '../crop.service';

import { CropName } from '../../../common/enums/farm.enum';

@Injectable()
export class CropGuard {
  constructor(
    private readonly cropService: CropService,
    private readonly cropName?: CropName,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('authentication failed');
    }

    const { cropId } = request.params;

    if (!cropId) {
      throw new UnauthorizedException('no crop id provided');
    }

    const crop = await this.cropService.findOne(this.cropName, cropId);

    if (!crop) {
      throw new UnauthorizedException(`crop with id ${cropId} not found`);
    }

    if (crop.farm.user.id !== user['id']) {
      throw new UnauthorizedException(
        `crop with id ${cropId} does not belong to the current user's farm`,
      );
    }

    return true;
  }
}

export const CropGuardFactory = (cropName: CropName): Type<CanActivate> => {
  @Injectable()
  class DynamicCropGuard extends CropGuard {
    constructor(cropService: CropService) {
      super(cropService, cropName);
    }
  }

  return DynamicCropGuard;
};
