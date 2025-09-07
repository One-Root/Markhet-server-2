import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { OtpService } from '../otp/otp.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

import { AuthData } from '../../common/interfaces/auth.interface';
import { LocationService } from '../location/location.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly locationService: LocationService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthData> {
    const {
      name,
      village,
      taluk,
      district,
      mobileNumber,
      language,
      identity,
      fcmToken,
      deviceId,
      cropNames,
      knownLanguages,
      profileImage,
      preferredPaymentModes,
      state,
    } = signupDto;

    const existingUser =
      await this.userService.findByMobileNumber(mobileNumber);

    if (existingUser) {
      throw new UnauthorizedException('user already exists');
    }

    const pincode = await this.locationService.getPincodeByLocation(
      state,
      district,
      taluk,
      village,
    );

    if (!pincode) {
      throw new BadRequestException('invalid location details');
    }

    const user = await this.userService.create({
      name,
      village,
      taluk,
      district,
      pincode,
      mobileNumber,
      language,
      identity,
      fcmToken,
      deviceId,
      cropNames,
      knownLanguages,
      preferredPaymentModes,
      profileImage,
    });

    const session = await this.sessionService.createSession(user, deviceId);

    return {
      user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthData> {
    const { mobileNumber, otp, deviceId } = loginDto;

    const { valid } = await this.otpService.verifyOtp(mobileNumber, otp);

    if (!valid) {
      throw new BadRequestException('invalid OTP');
    }

    const user = await this.userService.findByMobileNumber(mobileNumber);

    if (!user) {
      return { accessToken: null, refreshToken: null, user: null };
    }

    const session = await this.sessionService.createSession(user, deviceId);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user,
    };
  }

  async refreshTokens(refreshToken: string) {
    return this.sessionService.refreshSession(refreshToken);
  }

  verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('invalid or expired token');
    }
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    const { userId, deviceId } = logoutDto;

    await this.sessionService.logout(userId, deviceId);
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.profileImage = imageUrl;
    return this.userService.update(userId, { profileImage: imageUrl });
  }
}
