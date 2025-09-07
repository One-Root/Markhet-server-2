import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

import { OtpModule } from '../../modules/otp/otp.module';
import { SessionModule } from '../session/session.module';
import { JwtConfigModule } from '../../config/jwt/jwt-config.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    JwtConfigModule,
    OtpModule,
    UserModule,
    SessionModule,
    FileModule,
    LocationModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, JwtStrategy, AuthService],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
