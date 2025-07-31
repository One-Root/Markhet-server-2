import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Controller,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

import { Channel } from '@one-root/markhet-core';

import { ChannelService } from './channel.service';

import { CreateChannelDto } from './dto/create-channel.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ApiResponse<Channel>> {
    const channel = await this.channelService.create(createChannelDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'channel created successfully',
      channel,
    );
  }

  @Get()
  async getChannels(): Promise<ApiResponse<Channel[]>> {
    const channels = await this.channelService.findAll();

    return new ApiResponse(
      HttpStatus.OK,
      'channels retrieved successfully',
      channels,
    );
  }

  @Get(':id')
  async getChannel(@Param('id') id: string): Promise<ApiResponse<Channel>> {
    const channel = await this.channelService.findOne(id);

    if (!channel) {
      throw new NotFoundException(`channel with id ${id} not found`);
    }

    return new ApiResponse(
      HttpStatus.OK,
      'channel retrieved successfully',
      channel,
    );
  }

  @Put(':id/members')
  async addMembers(
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ): Promise<ApiResponse<Channel>> {
    const channel = await this.channelService.addMembers(id, userIds);

    return new ApiResponse(
      HttpStatus.OK,
      'members added successfully',
      channel,
    );
  }

  @Put(':id/members/remove')
  async removeMembers(
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ): Promise<ApiResponse<Channel>> {
    const channel = await this.channelService.removeMembers(id, userIds);

    return new ApiResponse(
      HttpStatus.OK,
      'members removed successfully',
      channel,
    );
  }
}
