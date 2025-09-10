import { In, Not, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { plainToClass } from 'class-transformer';

import { User } from '@one-root/markhet-core';

import { GetStreamService } from '../../services/get-stream.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryParamsDto } from './dto/get-users-query-params.dto';

import { Identity } from '../../common/enums/user.enum';
import { applyOperator } from '../../common/utils/apply-operator.util';
import { BulkUpdate } from '../../common/interfaces/scheduler.interface';
import { LocationService } from '../location/location.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly getStreamService: GetStreamService,
    private readonly getLocationService: LocationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    try {
      const location = await this.getLocationService.getLatLngByAddress(
        user.village,
      );
      user.latitude = location.lat;
      user.longitude = location.lng;
    } catch (error) {
      console.warn(
        'Failed to fetch location, proceeding without coordinates:',
        error.message,
      );
      user.latitude = null;
      user.longitude = null;
    }

    return this.userRepository.save(user);
  }

  findByMobileNumber(mobileNumber: string): Promise<User> {
    return this.userRepository.findOne({
      where: { mobileNumber },
    });
  }

  async findAll(params: Partial<GetUsersQueryParamsDto>): Promise<User[]> {
    const {
      page = 1,
      limit = 10,
      ...rest
    } = plainToClass(GetUsersQueryParamsDto, params);

    const skip = (page - 1) * limit;

    // initialize conditions
    const userConditions: Record<string, any> = {};

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      const [field, operator] = key.split('__');

      userConditions[field] = operator ? applyOperator(operator, value) : value;
    }

    // combine conditions
    const conditions: Record<string, any> = {
      ...(Object.keys(userConditions).length && userConditions),
    };

    const options = {
      skip,
      take: limit,
      where: conditions,
      relations: ['dailyPrices'],
    };

    const users = await this.userRepository.find(options);

    // set date range for last 7 days
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const end = new Date();

    for (const user of users) {
      const prices = [];

      for (const price of user.dailyPrices) {
        const createdAt = new Date(price.createdAt);

        if (createdAt >= start && createdAt <= end) {
          prices.push(price);
        }
      }

      user.dailyPrices = prices;
    }

    return users;
  }

  findById(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['dailyPrices'],
    });
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(userIds) },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    user.fcmToken = fcmToken;

    return this.userRepository.save(user);
  }

  async updateLastActiveAt(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    user.lastActiveAt = new Date();

    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    await this.userRepository.remove(user);
  }

  async generateGetStreamToken(userId: string): Promise<string> {
    return this.getStreamService.generateToken(userId);
  }

  async getFcmTokensByUserIds(userIds: string[]): Promise<string[]> {
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      select: ['fcmToken'],
    });

    return users
      .map((user) => user.fcmToken)
      .filter((fcmToken) => fcmToken != null);
  }

  async getAvailableAgent() {
    return this.userRepository.findOne({
      where: {
        identity: Identity.SUPPORT,
        mobileNumber: '+919606031885',
      },
    });
  }

  async bulkUpdate(updates: BulkUpdate[]): Promise<void> {
    const promises = updates.map(({ id, ...rest }) =>
      this.userRepository.update(id, { ...rest }),
    );

    await Promise.all(promises);
  }
}
