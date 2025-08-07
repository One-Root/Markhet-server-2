import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';

import {
  Banana,
  Turmeric,
  DryCoconut,
  TenderCoconut,
  Sunflower,
} from '@one-root/markhet-core';

import { FarmService } from '../farm/farm.service';
import { CacheService } from '../cache/cache.service';

import { CropName } from '../../common/enums/farm.enum';

import { CreateBananaDto } from './dto/create-banana.dto';
import { CreateTurmericDto } from './dto/create-turmeric.dto';
import { CreateDryCoconutDto } from './dto/create-dry-coconut.dto';
import { CreateTenderCoconutDto } from './dto/create-tender-coconut.dto';
import { UpdateBananaDto } from './dto/update-banana.dto';
import { UpdateTurmericDto } from './dto/update-turmeric.dto';
import { UpdateDryCoconutDto } from './dto/update-dry-coconut.dto';
import { UpdateTenderCoconutDto } from './dto/update-tender-coconut.dto';
import { GetCropsQueryParamsDto } from './dto/get-crops-query-params.dto';
import { CreateSunflowerDto } from './dto/create-sunflower.dto';
import { UpdateSunflowerDto } from './dto/update-sunflower.dto';

import { CropType } from '../../common/types/crop.type';
import { Language } from '../../common/enums/user.enum';
import { BulkUpdate } from '../../common/interfaces/scheduler.interface';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { CROP_IMAGE_MAP } from '../../common/constants/crop-images.constant';

import {
  BananaVariety,
  TurmericVariety,
  DryCoconutVariety,
  TenderCoconutVariety,
  SunflowerVariety,
} from '../../common/enums/crop.enum';
import { applyOperator } from '../../common/utils/apply-operator.util';
import { EventPublisher } from '../event/publisher/event.publisher';
import { EventQueue, NotificationEvent } from 'src/common/enums/event.enum';

type CropWithImageUrl<T> = T & { imageUrl: string };

@Injectable()
export class CropService {
  constructor(
    @InjectRepository(TenderCoconut)
    private readonly tenderCoconutRepository: Repository<TenderCoconut>,

    @InjectRepository(Turmeric)
    private readonly turmericRepository: Repository<Turmeric>,

    @InjectRepository(Banana)
    private readonly bananaRepository: Repository<Banana>,

    @InjectRepository(DryCoconut)
    private readonly dryCoconutRepository: Repository<DryCoconut>,

    @InjectRepository(Sunflower)
    private readonly sunflowerRepository: Repository<Sunflower>,

    private readonly farmService: FarmService,

    private readonly cacheService: CacheService,

    private readonly eventPublisher: EventPublisher,
  ) {}

  private _addImageUrlToCrop<T extends CropType>(crop: T): CropWithImageUrl<T> {
    if (!crop) {
      return null;
    }
    return {
      ...crop,
      imageUrl: CROP_IMAGE_MAP[crop.cropName] || null,
    };
  }
  async findOne(
    cropName: CropName,
    id: string,
  ): Promise<CropWithImageUrl<CropType>> {
    const repository = this.getRepository(cropName);

    const crop = await repository.findOne({
      where: { id },

      relations: ['farm', 'farm.user'],
    });

    if (!crop) {
      throw new NotFoundException(
        `no crop found with crop id '${id}' and crop '${cropName}'`,
      );
    }

    return this._addImageUrlToCrop(crop);
  }

  async findAll(
    params: Partial<GetCropsQueryParamsDto>,
    request?: CustomRequest,
  ): Promise<CropWithImageUrl<CropType>[]> {
    const {
      cropName,
      page = 1,
      limit = 10,
      ...rest
    } = plainToClass(GetCropsQueryParamsDto, params);

    const repository = this.getRepository<TenderCoconut>(cropName);

    const language = request ? request.headers['accept-language'] : Language.EN;

    const key = `crops:${repository.metadata.name}:${language}:${JSON.stringify(params)}`;

    // check if the data is in the cache
    const data = await this.cacheService.get<CropWithImageUrl<CropType>[]>(key);

    if (data && request) {
      request.fromCache = true;

      return data;
    }

    const skip = (page - 1) * limit;

    // initialize conditions
    const cropConditions: Record<string, any> = {};
    const farmConditions: Record<string, any> = {};
    const userConditions: Record<string, any> = {};

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('farm__user__')) {
        const userField = key.replace('farm__user__', '');

        const [field, operator] = userField.split('__');

        userConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      } else if (key.startsWith('farm__')) {
        const farmField = key.replace('farm__', '');

        const [field, operator] = farmField.split('__');

        farmConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      } else {
        const [field, operator] = key.split('__');

        cropConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      }
    }

    // combine conditions
    const conditions: Record<string, any> = {
      ...(Object.keys(cropConditions).length && cropConditions),
      farm:
        Object.keys(farmConditions).length || Object.keys(userConditions).length
          ? {
              ...(Object.keys(farmConditions).length && farmConditions),
              ...(Object.keys(userConditions).length && {
                user: userConditions,
              }),
            }
          : undefined,
    };

    const options = {
      skip,
      take: limit,
      where: conditions,
      relations: ['farm', 'farm.user'],
      order: {
        score: 'DESC' as const,
      },
    };

    const crops = await repository.find(options);

    // Add image URL to each crop before returning and caching
    const cropsWithImages = crops.map((crop) => this._addImageUrlToCrop(crop));

    if (request) {
      // cache the results for future queries
      await this.cacheService.set(key, cropsWithImages);

      request.fromCache = false;
    }

    return cropsWithImages;
  }

  async createTenderCoconut(
    farmId: string,
    createFarmDto: CreateTenderCoconutDto,
  ): Promise<CropWithImageUrl<TenderCoconut>> {
    const farm = await this.farmService.findOne(farmId);

    const repository = this.getRepository<TenderCoconut>(
      CropName.TENDER_COCONUT,
    );

    const crop = repository.create({
      ...createFarmDto,
      farm,
      cropName: CropName.TENDER_COCONUT,
    }) as TenderCoconut;

    const savedCrop = await repository.save(crop);
    return this._addImageUrlToCrop(savedCrop);
  }

  async createTurmeric(
    farmId: string,
    createTurmericDto: CreateTurmericDto,
  ): Promise<CropWithImageUrl<Turmeric>> {
    const farm = await this.farmService.findOne(farmId);

    const repository = this.getRepository<Turmeric>(CropName.TURMERIC);

    const crop = repository.create({
      ...createTurmericDto,
      farm,
      cropName: CropName.TURMERIC,
    }) as Turmeric;
    const savedCrop = await repository.save(crop);
    return this._addImageUrlToCrop(savedCrop);
  }

  async createBanana(
    farmId: string,
    createBananaDto: CreateBananaDto,
  ): Promise<CropWithImageUrl<Banana>> {
    const farm = await this.farmService.findOne(farmId);

    const repository = this.getRepository<Banana>(CropName.BANANA);

    const crop = repository.create({
      ...createBananaDto,
      farm,
      cropName: CropName.BANANA,
    }) as Banana;
    const savedCrop = await repository.save(crop);
    return this._addImageUrlToCrop(savedCrop);
  }

  async createDryCoconut(
    farmId: string,
    createDryCoconutDto: CreateDryCoconutDto,
  ): Promise<CropWithImageUrl<DryCoconut>> {
    const farm = await this.farmService.findOne(farmId);

    const repository = this.getRepository<DryCoconut>(CropName.DRY_COCONUT);

    const crop = repository.create({
      ...createDryCoconutDto,
      farm,
      cropName: CropName.DRY_COCONUT,
    }) as DryCoconut;

    const savedCrop = await repository.save(crop);
    return this._addImageUrlToCrop(savedCrop);
  }

  async createSunflower(
    farmId: string,
    createSunflowerDto: CreateSunflowerDto,
  ): Promise<CropWithImageUrl<Sunflower>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<Sunflower>(CropName.SUNFLOWER);

    const crop = repository.create({
      sunflowerVariety: createSunflowerDto.sunflowerVariety,
      farm: farm,
      cropName: CropName.SUNFLOWER,
    }) as Sunflower;
    const savedCrop = await repository.save(crop);
    return this._addImageUrlToCrop(savedCrop);
  }

  async updateTenderCoconut(
    id: string,
    updateTenderCoconutDto: UpdateTenderCoconutDto,
  ): Promise<TenderCoconut> {
    const repository = this.getRepository<TenderCoconut>(
      CropName.TENDER_COCONUT,
    );

    const crop = await repository.findOne({
      where: { id },
      relations: ['farm', 'farm.user'],
    });

    if (!crop) {
      throw new NotFoundException(`tender coconut with id ${id} not found`);
    }

    // console.log(
    //   `updating tender coconut with id ${id}`,
    //   updateTenderCoconutDto,
    //   crop.farm.user.mobileNumber,
    // );

    // const options = { removeOnComplete: true, removeOnFail: true };

    // const isToggle =
    //   crop.isReadyToHarvest !== updateTenderCoconutDto.isReadyToHarvest;

    // if (isToggle) {
    //   await this.eventPublisher.publish(
    //     {
    //       queue: EventQueue.NOTIFICATION,
    //       type: NotificationEvent.CHATRACE_RTH,
    //       data: {
    //         number: crop.farm.user.mobileNumber,
    //         name: crop.farm.user.name,
    //         status: updateTenderCoconutDto.isReadyToHarvest,
    //         cropName: CropName.TENDER_COCONUT,
    //       },
    //     },
    //     options,
    //   );
    // }

    Object.assign(crop, updateTenderCoconutDto);

    return repository.save(crop);
  }

  async updateTurmeric(
    id: string,
    updateTurmericDto: UpdateTurmericDto,
  ): Promise<Turmeric> {
    const repository = this.getRepository<Turmeric>(CropName.TURMERIC);

    const crop = await repository.findOne({ where: { id } });

    if (!crop) {
      throw new NotFoundException(`turmeric with id ${id} not found`);
    }

    Object.assign(crop, updateTurmericDto);

    return repository.save(crop);
  }

  async updateBanana(
    id: string,
    updateBananaDto: UpdateBananaDto,
  ): Promise<Banana> {
    const repository = this.getRepository<Banana>(CropName.BANANA);

    const crop = await repository.findOne({ where: { id } });

    if (!crop) {
      throw new NotFoundException(`banana with id ${id} not found`);
    }

    Object.assign(crop, updateBananaDto);

    return repository.save(crop);
  }

  async updateDryCoconut(
    id: string,
    updateDryCoconutDto: UpdateDryCoconutDto,
  ): Promise<DryCoconut> {
    const repository = this.getRepository<DryCoconut>(CropName.DRY_COCONUT);

    const crop = await repository.findOne({ where: { id } });

    if (!crop) {
      throw new NotFoundException(`dry coconut with id ${id} not found`);
    }

    Object.assign(crop, updateDryCoconutDto);

    return repository.save(crop);
  }

  async updateSunflower(
    id: string,
    updateSunflowerDto: UpdateSunflowerDto,
  ): Promise<Sunflower> {
    const repository = this.getRepository<Sunflower>(CropName.SUNFLOWER);

    const crop = await repository.findOne({ where: { id } });

    if (!crop) {
      throw new NotFoundException(`sunflower with id ${id} not found`);
    }

    Object.assign(crop, updateSunflowerDto);

    return repository.save(crop);
  }

  isValidVariety(cropName: CropName, cropVariety: string): boolean {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return Object.values(TenderCoconutVariety).includes(
          cropVariety as TenderCoconutVariety,
        );

      case CropName.TURMERIC:
        return Object.values(TurmericVariety).includes(
          cropVariety as TurmericVariety,
        );

      case CropName.BANANA:
        return Object.values(BananaVariety).includes(
          cropVariety as BananaVariety,
        );

      case CropName.DRY_COCONUT:
        return Object.values(DryCoconutVariety).includes(
          cropVariety as DryCoconutVariety,
        );

      case CropName.SUNFLOWER:
        return Object.values(SunflowerVariety).includes(
          cropVariety as SunflowerVariety,
        );

      default:
        return false;
    }
  }

  getRepository<T extends CropType>(cropName: CropName): Repository<T> {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return this.tenderCoconutRepository as Repository<T>;

      case CropName.TURMERIC:
        return this.turmericRepository as Repository<T>;

      case CropName.BANANA:
        return this.bananaRepository as Repository<T>;

      case CropName.DRY_COCONUT:
        return this.dryCoconutRepository as Repository<T>;

      case CropName.SUNFLOWER:
        return this.sunflowerRepository as Repository<T>;

      default:
        throw new Error(`repository for crop '${cropName}' not found`);
    }
  }

  async bulkUpdate(updates: BulkUpdate[]): Promise<void> {
    const promises = updates.map(({ id, cropName, ...rest }) => {
      const repository = this.getRepository(cropName);

      repository.update(id, { ...rest });
    });

    await Promise.all(promises);
  }

  async remove(id: string, cropName: CropName): Promise<void> {
    const crop = await this.findOne(cropName, id);

    if (!crop) {
      throw new NotFoundException(`crop with id ${id} not found`);
    }

    const repository = this.getRepository(cropName);

    await repository.remove(crop);
  }
}
