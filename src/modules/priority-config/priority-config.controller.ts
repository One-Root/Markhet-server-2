import {
  Get,
  Body,
  Patch,
  Query,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { PriorityConfig } from '@one-root/markhet-core';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { PriorityConfigService } from './priority-config.service';
import { CreatePriorityConfigDto } from './dto/create-priority-config.dto';

import { ConfigRelation } from '../../common/enums/priority-config.enum';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('priority-config')
@UseGuards(JwtAuthGuard, SessionGuard)
export class PriorityConfigController {
  constructor(private readonly priorityConfigService: PriorityConfigService) {}

  @Get()
  async getPriorityConfig(
    @Query('entity') entity: ConfigRelation,
  ): Promise<ApiResponse<PriorityConfig>> {
    const config = await this.priorityConfigService.findOne(entity);

    return new ApiResponse(
      HttpStatus.OK,
      'priority config retrieved successfully',
      config,
    );
  }

  @Patch()
  async updatePriorityConfig(
    @Body() createPriorityConfigDto: CreatePriorityConfigDto,
  ): Promise<ApiResponse<PriorityConfig>> {
    const config = await this.priorityConfigService.update(
      createPriorityConfigDto,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'priority config updated successfully',
      config,
    );
  }
}
