import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PO, POInterest, User } from '@one-root/markhet-core';
import { Repository } from 'typeorm';
import { AddPOInterestDto } from './dto/add-po.dto';
import { CropName } from 'src/common/enums/farm.enum';

@Injectable()
export class PoService {
  private readonly logger = new Logger(PoService.name);

  constructor(
    @InjectRepository(PO)
    private readonly pORepository: Repository<PO>,
    @InjectRepository(POInterest)
    private readonly poInterestRepository: Repository<POInterest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(cropName: CropName): Promise<PO[]> {
    try {
      const cards = await this.pORepository.find({
        where: {
          cropName: cropName,
        },
        relations: ['interests'],
      });

      if (!cards || cards.length === 0) {
        this.logger.warn('No purchase orders found');
        throw new NotFoundException('No purchase orders found');
      }

      this.logger.log(`Fetched ${cards.length} purchase orders`);
      return cards;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // let 404 propagate
      }
      this.logger.error('Failed to fetch purchase orders', error.stack);
      throw new InternalServerErrorException('Failed to fetch purchase orders');
    }
  }

  async getPoById(id: string) {
    try {
      const po = await this.pORepository.findOne({
        where: { id },
        relations: ['interests', 'interests.user'],
      });

      if (!po) {
        this.logger.warn(`PO not found with id: ${id}`);
        throw new NotFoundException(`PO not found with id: ${id}`);
      }

      this.logger.log(`Fetched PO with id: ${id}`);
      return po;
    } catch (error) {
      this.logger.error(`Failed to fetch PO with id: ${id}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to fetch PO with id: ${id}`,
      );
    }
  }

  async addInterestToPO(dto: AddPOInterestDto, userId) {
    try {
      const po = await this.pORepository.findOne({ where: { id: dto.poId } });
      if (!po) {
        this.logger.warn(`PO not found with id: ${userId}`);
        throw new NotFoundException(`PO not found with id: ${userId}`);
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`User not found with id: ${user}`);
        throw new NotFoundException(`User not found with id: ${userId}`);
      }

      let existingInterest = await this.poInterestRepository.findOne({
        where: { po: { id: po.id }, user: { id: user.id } },
      });

      if (existingInterest) {
        this.logger.log(
          `User ${user.id} already has interest in PO ${po.id}, updating quantity and commitDate`,
        );
        existingInterest.quantity = dto.quantity;
        existingInterest.commitDate = new Date(dto.commitDate);
        return await this.poInterestRepository.save(existingInterest);
      }

      const interest = this.poInterestRepository.create({
        po,
        user,
        quantity: dto.quantity,
        commitDate: new Date(dto.commitDate),
      });

      this.logger.log(`Adding new interest for user ${user.id} to PO ${po.id}`);
      return await this.poInterestRepository.save(interest);
    } catch (error) {
      this.logger.error(`Failed to add interest to PO`, error.stack);
      throw new InternalServerErrorException('Failed to add interest to PO');
    }
  }
}
