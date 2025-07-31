import {
  Req,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Reservation } from '@one-root/markhet-core';

import { ReservationService } from './reservation.service';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

import { CropName } from '../../common/enums/farm.enum';

@Controller('reservations')
@UseGuards(JwtAuthGuard, SessionGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async getReservations(
    @Req() req: CustomRequest,
  ): Promise<ApiResponse<Reservation[]>> {
    const reservations = await this.reservationService.findAll(req.user);

    return new ApiResponse(
      HttpStatus.OK,
      'reservations retrieved successfully',
      reservations,
    );
  }

  @Get(':id')
  async getReservation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Reservation>> {
    const reservations = await this.reservationService.findOne(id);

    return new ApiResponse(
      HttpStatus.OK,
      'reservations retrieved successfully',
      reservations,
    );
  }

  @Get('crop/:cropName')
  async getReservationsByCrop(
    @Req() req: CustomRequest,
    @Param('cropName') cropName: CropName,
  ): Promise<ApiResponse<Reservation[]>> {
    const reservations = await this.reservationService.findByCrop(
      req.user,
      cropName,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'reservations retrieved successfully',
      reservations,
    );
  }

  @Post()
  async createReservation(
    @Req() req: CustomRequest,
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<ApiResponse<Reservation>> {
    const reservation = await this.reservationService.create(
      req.user,
      createReservationDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'reservation created successfully',
      reservation,
    );
  }

  @Patch(':id/status')
  async updateReservationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ApiResponse<Reservation>> {
    const { status } = updateReservationStatusDto;

    const reservation = await this.reservationService.updateStatus(id, status);

    return new ApiResponse(
      HttpStatus.OK,
      'reservation status updated successfully',
      reservation,
    );
  }
}
