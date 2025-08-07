import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDateColumn, Repository } from 'typeorm';

import { CropCard, CropCardInterest, User } from '@one-root/markhet-core';
import {
  CropCardData,
  CropCardUpdateData,
} from '../../common/types/crop-card.type';
import { CropCardStatus } from 'src/common/enums/crop-card.enum';
import { CropName } from 'src/common/enums/farm.enum';
import { Identity } from 'src/common/enums/user.enum';
import { CROP_IMAGE_MAP } from '../../common/constants/crop-images.constant';

import { CropService } from '../crop/crop.service';
import { CacheService } from '../cache/cache.service';
import { UserService } from '../user/user.service';

export interface DashboardCropCard {
  cardId: string;
  cropName: string;
  imageUrl: string;
  farmName: string;
  additionalNotes?: string;
  status: CropCardStatus;
  createdAt: Date;
  interestsCount: number;
}

@Injectable()
export class CropCardService {
  constructor(
    @InjectRepository(CropCard)
    private readonly cropCardRepo: Repository<CropCard>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    // [IMPROVEMENT] Interest repository ko inject karein
    @InjectRepository(CropCardInterest)
    private readonly interestRepo: Repository<CropCardInterest>,
    private readonly userService: UserService,
    private readonly cropService: CropService,
    private readonly cacheService: CacheService,
  ) {}

  // [FIXED] cropName parameter add kiya gaya
  async createCropCard(
    farmerId: string,
    cropId: string,
    cropName: CropName,
  ): Promise<CropCard> {
    const crop = await this.cropService.findOne(cropName, cropId);
    if (!crop || crop?.farm?.user?.id !== farmerId) {
      throw new NotFoundException(`Crop not found or not owned by this farmer`);
    }

    const existingCard = await this.cropCardRepo.findOne({
      where: { crop: { id: cropId } },
    });
    if (existingCard) {
      throw new BadRequestException(
        `A crop card for this crop already exists (id: ${existingCard.id})`,
      );
    }

    const farmer = await this.userService.findById(farmerId);

    // [IMPROVEMENT] Snapshot ki ek saaf copy banayein
    const snapshot = { ...crop };
    delete snapshot.farm;

    const card = this.cropCardRepo.create({
      farmer,
      crop,
      cropSnapshot: snapshot,
      status: CropCardStatus.STARTED,
    });

    const saved = await this.cropCardRepo.save(card);
    await this.cacheService.delete(`dashboard:${farmerId}`);
    return saved;
  }

  // [FIXED] Interest ko database mein save kiya ja raha hai
  async expressInterest(
    cardId: string,
    buyerId: string,
  ): Promise<{
    success: boolean;
    message: string;
    interestedBuyersCount: number;
  }> {
    const cropCard = await this.cropCardRepo.findOne({
      where: { id: cardId, status: CropCardStatus.STARTED },
      relations: ['farmer', 'interests', 'interests.buyer'],
    });

    if (!cropCard) {
      throw new NotFoundException(
        'Crop card not found or not available for selling',
      );
    }

    const buyer = await this.userRepo.findOneBy({ id: buyerId });
    if (!buyer || buyer.identity !== Identity.BUYER) {
      throw new BadRequestException(
        'Only verified buyers can express interest.',
      );
    }

    const isAlreadyInterested = cropCard.interests.some(
      (interest) => interest.buyer.id === buyerId,
    );

    if (isAlreadyInterested) {
      return {
        success: false,
        message: 'You have already expressed interest in this crop.',
        interestedBuyersCount: cropCard.interests.length,
      };
    }

    // Naya interest object banakar save karein
    const newInterest = this.interestRepo.create({
      buyer,
      cropCard,
    });
    await this.interestRepo.save(newInterest);

    // Farmer ka dashboard cache clear karein
    await this.cacheService.delete(`dashboard:${cropCard.farmer.id}`);

    // Naya count laane ke liye dobara find karein
    const updatedCard = await this.cropCardRepo.findOne({
      where: { id: cardId },
      relations: ['interests'],
    });

    return {
      success: true,
      message: 'Interest expressed successfully',
      interestedBuyersCount: updatedCard.interests.length,
    };
  }

  // [FIXED] Sahi tarike se interest remove kiya ja raha hai
  async removeInterest(
    cardId: string,
    buyerId: string,
  ): Promise<{
    success: boolean;
    message: string;
    interestedBuyersCount: number;
  }> {
    const interest = await this.interestRepo.findOne({
      where: {
        cropCard: { id: cardId },
        buyer: { id: buyerId },
      },
      relations: ['cropCard', 'cropCard.farmer'],
    });

    if (!interest) {
      throw new NotFoundException('Interest not found for this crop card.');
    }

    const farmerId = interest.cropCard.farmer.id;
    await this.interestRepo.remove(interest);

    // Cache clear karein
    await this.cacheService.delete(`dashboard:${farmerId}`);

    const updatedCard = await this.cropCardRepo.findOne({
      where: { id: cardId },
      relations: ['interests'],
    });

    return {
      success: true,
      message: 'Interest removed successfully',
      interestedBuyersCount: updatedCard.interests.length,
    };
  }

  async getInterestedBuyers(cardId: string, farmerId: string): Promise<any[]> {
    const cropCard = await this.cropCardRepo.findOne({
      where: { id: cardId, farmer: { id: farmerId } },
      relations: ['interests', 'interests.buyer'],
    });

    if (!cropCard) {
      throw new NotFoundException('Crop card not found or access denied');
    }

    return cropCard.interests.map((interest) => {
      const buyer = interest.buyer;
      return {
        id: buyer.id,
        name: buyer.name,
        phoneNumber: buyer.mobileNumber,
        interestedAt: interest.createdAt,
      };
    });
  }

  async getFarmerActiveCropCards(
    farmerId: string,
  ): Promise<DashboardCropCard[]> {
    const key = `dashboard:${farmerId}`;
    const cached = await this.cacheService.get<DashboardCropCard[]>(key);
    if (cached) return cached;

    const cards = await this.cropCardRepo.find({
      where: { farmer: { id: farmerId }, status: CropCardStatus.STARTED },
      relations: ['crop', 'crop.farm', 'interests'],
      order: { createdAt: 'DESC' },
    });

    const result = cards.map((card) => {
      const cs = card.cropSnapshot as any;
      const farmName = card.crop
        ? (card.crop.farm as any).name
        : 'Farm Not Available';
      return {
        cardId: card.id,
        cropName: cs.cropName,
        imageUrl: CROP_IMAGE_MAP[cs.cropName] || null,
        farmName: farmName,
        additionalNotes: card.additionalNotes,
        status: card.status,
        createdAt: card.createdAt,
        interestsCount: card.interests?.length || 0,
        // [IMPROVEMENT] Poora crop object hataya gaya
      };
    });

    await this.cacheService.set(key, result, 600);
    return result;
  }

  async updateCropCard(
    cardId: string,
    farmerId: string,
    data: CropCardUpdateData,
  ): Promise<CropCard> {
    const card = await this.cropCardRepo.findOne({
      where: { id: cardId, farmer: { id: farmerId } },
    });
    if (!card) throw new NotFoundException(`Crop card not found`);

    Object.assign(card, data);
    if (data.status === CropCardStatus.ENDED) {
      card.endedAt = new Date();
    }

    const saved = await this.cropCardRepo.save(card);
    await this.cacheService.delete(`dashboard:${farmerId}`);
    return saved;
  }

  async findCropCardById(cardId: string, farmerId?: string): Promise<CropCard> {
    const where: any = { id: cardId };
    if (farmerId) where.farmer = { id: farmerId };

    const card = await this.cropCardRepo.findOne({
      where,
      relations: [
        'farmer',
        'crop',
        'crop.farm',
        'interests',
        'interests.buyer',
      ],
    });
    if (!card) throw new NotFoundException(`Crop card not found`);
    return card;
  }
}
