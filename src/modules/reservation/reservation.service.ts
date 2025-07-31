import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, MoreThanOrEqual } from 'typeorm';

import { User, Reservation } from '@one-root/markhet-core';

import { CreateReservationDto } from './dto/create-reservation.dto';

import { CropService } from '../crop/crop.service';

import { EventPublisher } from '../event/publisher/event.publisher';

import { Identity } from '../../common/enums/user.enum';
import { CropName } from '../../common/enums/farm.enum';
import { ReservationStatus } from '../../common/enums/reservation.enum';
import { EventQueue, NotificationEvent } from '../../common/enums/event.enum';
import { getLocalizedMessage } from '../../common/utils/get-localized-message.util';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    private readonly CropService: CropService,

    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(
    user: User,
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const { cropName, cropId, price, reservationDate } = createReservationDto;

    const crop = await this.CropService.findOne(cropName, cropId);

    const date = new Date(new Date().setDate(new Date().getDate() - 7));

    const existingReservation = await this.reservationRepository.findOne({
      where: {
        user: { id: user.id },
        crop: { id: crop.id },
        status: ReservationStatus.PENDING,
        createdAt: MoreThanOrEqual(date),
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        `pending reservation for ${cropName} exists within the last 7 days`,
      );
    }

    const payload = {
      user,
      price,
      crop,
      reservationDate,
    };

    const reservation = this.reservationRepository.create(payload);

    return this.reservationRepository.save(reservation);
  }

  async findAll(user: User): Promise<Reservation[]> {
    const { id, identity } = user;

    let where = {};

    if (identity === Identity.FARMER) {
      where = {
        crop: { farm: { user: { id } } },
      };
    } else if (identity === Identity.BUYER) {
      where = {
        user: { id },
      };
    } else {
      throw new Error(
        `invalid identity '${identity}', expected 'farmer' or 'buyer'.`,
      );
    }

    return this.reservationRepository.find({
      where,
      relations: ['crop', 'crop.farm', 'crop.farm.user'],
    });
  }

  async findByCrop(user: User, cropName: CropName): Promise<Reservation[]> {
    const { id, identity } = user;

    let where = {};
    let relations = ['crop', 'crop.farm'];

    if (identity === Identity.FARMER) {
      where = {
        crop: { cropName, farm: { user: { id } } },
      };

      relations.push('user');
    } else if (identity === Identity.BUYER) {
      where = {
        user: { id },
        crop: { cropName },
      };

      relations.push('crop.farm.user');
    } else {
      throw new Error(
        `invalid identity '${identity}', expected 'farmer' or 'buyer'.`,
      );
    }

    return this.reservationRepository.find({
      where,
      relations,
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['crop', 'crop.farm', 'crop.farm.user'],
    });

    if (!reservation) {
      throw new NotFoundException(`reservation with id ${id} not found`);
    }

    return reservation;
  }

  findReservationsByDateAndStatus(date: Date, status: ReservationStatus) {
    return this.reservationRepository.find({
      where: {
        reservationDate: date,
        status,
      },
      relations: ['user', 'crop'],
    });
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['crop', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException(`reservation with id ${id} not found`);
    }

    reservation.status = status;

    const { crop, user } = reservation;

    if (user.fcmToken && status === ReservationStatus.CONFIRMED) {
      const title = getLocalizedMessage(
        'reservation_confirmed_title',
        user.language,
        {},
      );

      const body = getLocalizedMessage(
        'reservation_confirmed_body',
        user.language,
        { cropName: crop.cropName },
      );

      // payload
      const payload = {
        queue: EventQueue.NOTIFICATION,
        type: NotificationEvent.PUSH,
        data: {
          data: {
            title,
            body,
            link: `${process.env.DOMAIN}/buyer?reservationId=${reservation.id}`,
          },
          userIds: [user.id],
          language: user.language,
        },
      };

      // options
      const options = { removeOnComplete: true, removeOnFail: true };

      await this.eventPublisher.publish(payload, options);
    }

    return this.reservationRepository.save(reservation);
  }
}
