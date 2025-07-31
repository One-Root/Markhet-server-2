import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserService } from '../../user/user.service';

import { JwtPayload } from '../../../common/interfaces/jwt.interface';
import { CustomRequest } from '../../../common/interfaces/express.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload, req: CustomRequest) {
    const user = await this.userService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException({
        message: 'authentication failed',
        error: 'user not found.',
      });
    }

    req.user = user;

    return user;
  }
}
