import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Channel } from '@one-root/markhet-core';

import { CropService } from '../crop/crop.service';

import { CreateChannelDto } from './dto/create-channel.dto';

import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,

    private userService: UserService,

    private cropService: CropService,
  ) {}

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const { cropId, cropName, members } = createChannelDto;

    const users = await Promise.all(
      members.map(async (userId) => await this.userService.findById(userId)),
    );

    const crop = await this.cropService.findOne(cropName, cropId);

    const instance = this.channelRepository.create({
      ...createChannelDto,
      members: users,
      crop,
    });

    return await this.channelRepository.save(instance);
  }

  findAll(): Promise<Channel[]> {
    return this.channelRepository.find({ relations: ['members'] });
  }

  findOne(id: string): Promise<Channel> {
    return this.channelRepository.findOne({
      where: { id },
      relations: ['crop', 'members'],
    });
  }

  async addMembers(channelId: string, userIds: string[]): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['members'],
    });

    if (!channel) {
      throw new NotFoundException(`channel with id ${channelId} not found`);
    }

    const users = await Promise.all(
      userIds.map(async (userId) => await this.userService.findById(userId)),
    );

    channel.members.push(...users);

    return this.channelRepository.save(channel);
  }

  async removeMembers(channelId: string, userIds: string[]): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['members'],
    });

    if (!channel) {
      throw new NotFoundException(`channel with id ${channelId} not found`);
    }

    channel.members = channel.members.filter(
      (member) => !userIds.includes(member.id),
    );

    return this.channelRepository.save(channel);
  }
}
