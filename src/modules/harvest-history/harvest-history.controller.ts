import {
  Req,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { HarvestHistory } from '@one-root/markhet-core';

import { HarvestHistoryService } from './harvest-history.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CreateHarvestHistoryDto } from './dto/create-harvest-history.dto';

import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('harvest-history')
@UseGuards(JwtAuthGuard, SessionGuard)
export class HarvestHistoryController {
  constructor(private readonly harvestHistoryService: HarvestHistoryService) {}

  @Post()
  async create(
    @Req() request: CustomRequest,
    @Body() createHarvestHistoryDto: CreateHarvestHistoryDto,
  ): Promise<ApiResponse<HarvestHistory>> {
    const history = await this.harvestHistoryService.create(
      request.user,
      createHarvestHistoryDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'harvest history created successfully',
      history,
    );
  }
}
