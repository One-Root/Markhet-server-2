import {
  Get,
  Req,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  Controller,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

import { User } from '@one-root/markhet-core';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { GetUsersQueryParamsDto } from './dto/get-users-query-params.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

import { CustomRequest } from '../../common/interfaces/express.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, SessionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(
    @Query() params: GetUsersQueryParamsDto,
  ): Promise<ApiResponse<User[]>> {
    const users = await this.userService.findAll(params);

    return new ApiResponse(
      HttpStatus.OK,
      'users retrieved successfully',
      users,
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ApiResponse<User>> {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return new ApiResponse(HttpStatus.OK, 'user retrieved successfully', user);
  }

  @Get('/get-stream/token')
  async getGetStreamToken(
    @Req() req: CustomRequest,
  ): Promise<ApiResponse<{ token: string }>> {
    const token = await this.userService.generateGetStreamToken(req.user.id);

    return new ApiResponse(
      HttpStatus.OK,
      'get stream token generated successfully',
      {
        token,
      },
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const user = await this.userService.update(id, updateUserDto);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return new ApiResponse(HttpStatus.OK, 'user updated successfully', user);
  }

  @Patch(':id/fcm-token')
  async updateFcmToken(
    @Param('id') id: string,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ): Promise<ApiResponse<User>> {
    const { fcmToken } = updateFcmTokenDto;

    const user = await this.userService.updateFcmToken(id, fcmToken);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return new ApiResponse(HttpStatus.OK, 'user updated successfully', user);
  }

  @Patch(':id/last-active')
  async updateLastActiveAt(
    @Param('id') id: string,
  ): Promise<ApiResponse<User>> {
    const user = await this.userService.updateLastActiveAt(id);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return new ApiResponse(
      HttpStatus.OK,
      'user last active updated successfully',
      user,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.userService.delete(id);

    return new ApiResponse(
      HttpStatus.NO_CONTENT,
      'user deleted successfully',
      null,
    );
  }
}
