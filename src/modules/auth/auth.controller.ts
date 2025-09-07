import {
  Req,
  Post,
  Body,
  HttpStatus,
  Controller,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
  Patch,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../file/file.service';
import { Folders } from 'src/common/enums/file.enum';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

import { AuthData } from '../../common/interfaces/auth.interface';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('profileImage'))
  async signup(
    @UploadedFile() file: Express.Multer.File,
    @Body() signupDto: SignupDto,
  ): Promise<ApiResponse<AuthData>> {
    const url = file
      ? await this.fileService.upload(file, { folder: Folders.USER_PROFILES })
      : null;

    if (url) signupDto.profileImage = url;

    const { user, accessToken, refreshToken } =
      await this.authService.signup(signupDto);

    return new ApiResponse(HttpStatus.OK, 'user registered successfully', {
      user,
      accessToken,
      refreshToken,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthData>> {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);

    if (!user && !accessToken && !refreshToken) {
      return new ApiResponse(
        HttpStatus.NOT_FOUND,
        `user with mobile number ${loginDto.mobileNumber} not found`,
        {
          user,
          accessToken,
          refreshToken,
        },
      );
    }

    return new ApiResponse(HttpStatus.OK, 'login successful', {
      user,
      accessToken,
      refreshToken,
    });
  }

  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    const session = await this.authService.refreshTokens(refreshToken);

    return new ApiResponse(
      HttpStatus.OK,
      'session refreshed successfully',
      session,
    );
  }

  @Post('verify-token')
  async verifyToken(@Req() request: CustomRequest): Promise<ApiResponse<any>> {
    const header = request.headers['authorization'];

    if (!header) {
      throw new BadRequestException('authorization header is missing');
    }

    if (!header.startsWith('Bearer ') || header.split(' ').length !== 2) {
      throw new BadRequestException(
        'invalid authorization header format. expected "Bearer <token>"',
      );
    }

    const token = header.split(' ')[1];

    const decoded = await this.authService.verifyToken(token);

    return new ApiResponse(HttpStatus.OK, 'token is valid', decoded);
  }

  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }
  @Patch('update-profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
  ): Promise<ApiResponse<any>> {
    if (!file) {
      throw new BadRequestException('Profile image file is required');
    }

    const url = await this.fileService.upload(file, {
      folder: Folders.USER_PROFILES,
    });

    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const updatedUser = await this.authService.updateProfileImage(userId, url);

    return new ApiResponse(
      HttpStatus.OK,
      'Profile image updated successfully',
      updatedUser,
    );
  }
}
