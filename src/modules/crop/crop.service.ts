import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

import { Crop } from '@one-root/markhet-core';
import { FileService } from '../file/file.service';
import { Folders } from 'src/common/enums/file.enum';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { CROP_IMAGE_MAP } from '../../common/constants/crop-images.constant';
import { CropType } from '../../common/types/crop.type';
import { Language } from '../../common/enums/user.enum';
import { applyOperator } from '../../common/utils/apply-operator.util';
import { BulkUpdate } from '../../common/interfaces/scheduler.interface';
import { Farm } from '@one-root/markhet-core';

import {
  BananaVariety,
  TurmericVariety,
  DryCoconutVariety,
  TenderCoconutVariety,
  SunflowerVariety,
} from '../../common/enums/crop.enum';

type CropWithImageUrl<T> = T & { imageUrl: string };

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file (adjustable)
const MAX_IMAGES_PER_CROP = 10;
const UPLOAD_CONCURRENCY = 6;

@Injectable()
export class CropService {
  private readonly logger = new Logger(CropService.name);

  constructor(
    @InjectRepository(TenderCoconut)
    private readonly tenderCoconutRepoInjected: Repository<TenderCoconut>,

    @InjectRepository(Turmeric)
    private readonly turmericRepoInjected: Repository<Turmeric>,

    @InjectRepository(Banana)
    private readonly bananaRepoInjected: Repository<Banana>,

    @InjectRepository(DryCoconut)
    private readonly dryCoconutRepoInjected: Repository<DryCoconut>,

    @InjectRepository(Sunflower)
    private readonly sunflowerRepoInjected: Repository<Sunflower>,

    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,

    private readonly farmService: FarmService,

    private readonly cacheService: CacheService,

    private readonly fileService: FileService,
    private readonly dataSource: DataSource,
    @InjectRepository(Crop) private readonly cropRepo: Repository<Crop>,
  ) {}

  private _addImageUrlToCrop<T extends CropType>(crop: T): CropWithImageUrl<T> {
    if (!crop) return null;
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

    const key = `crops:${repository.metadata.name}:${language}:${JSON.stringify(
      params,
    )}`;

    const data = await this.cacheService.get<CropWithImageUrl<CropType>[]>(key);

    if (data && request) {
      request.fromCache = true;
      return data;
    }

    const skip = (page - 1) * limit;

    const cropConditions: Record<string, any> = {};
    const farmConditions: Record<string, any> = {};
    const userConditions: Record<string, any> = {};

    for (const [k, value] of Object.entries(rest)) {
      if (k.startsWith('farm__user__')) {
        const userField = k.replace('farm__user__', '');
        const [field, operator] = userField.split('__');
        userConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      } else if (k.startsWith('farm__')) {
        const farmField = k.replace('farm__', '');
        const [field, operator] = farmField.split('__');
        farmConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      } else {
        const [field, operator] = k.split('__');
        cropConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      }
    }

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

    const cropsWithImages = crops.map((crop) => this._addImageUrlToCrop(crop));

    if (request) {
      await this.cacheService.set(key, cropsWithImages);
      request.fromCache = false;
    }

    return cropsWithImages;
  }

  async createTenderCoconut(
    farmId: string,
    dto: CreateTenderCoconutDto,
  ): Promise<CropWithImageUrl<TenderCoconut>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<TenderCoconut>(
      CropName.TENDER_COCONUT,
    );
    const crop = repository.create({
      ...dto,
      farm,
      cropName: CropName.TENDER_COCONUT,
    }) as TenderCoconut;
    const saved = await repository.save(crop);
    return this._addImageUrlToCrop(saved);
  }

  async createTurmeric(
    farmId: string,
    dto: CreateTurmericDto,
  ): Promise<CropWithImageUrl<Turmeric>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<Turmeric>(CropName.TURMERIC);
    const crop = repository.create({
      ...dto,
      farm,
      cropName: CropName.TURMERIC,
    }) as Turmeric;
    const saved = await repository.save(crop);
    return this._addImageUrlToCrop(saved);
  }

  async createBanana(
    farmId: string,
    dto: CreateBananaDto,
  ): Promise<CropWithImageUrl<Banana>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<Banana>(CropName.BANANA);
    const crop = repository.create({
      ...dto,
      farm,
      cropName: CropName.BANANA,
    }) as Banana;
    const saved = await repository.save(crop);
    return this._addImageUrlToCrop(saved);
  }

  async createDryCoconut(
    farmId: string,
    dto: CreateDryCoconutDto,
  ): Promise<CropWithImageUrl<DryCoconut>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<DryCoconut>(CropName.DRY_COCONUT);
    const crop = repository.create({
      ...dto,
      farm,
      cropName: CropName.DRY_COCONUT,
    }) as DryCoconut;
    const saved = await repository.save(crop);
    return this._addImageUrlToCrop(saved);
  }

  async createSunflower(
    farmId: string,
    dto: CreateSunflowerDto,
  ): Promise<CropWithImageUrl<Sunflower>> {
    const farm = await this.farmService.findOne(farmId);
    const repository = this.getRepository<Sunflower>(CropName.SUNFLOWER);
    const crop = repository.create({
      sunflowerVariety: dto.sunflowerVariety,
      farm,
      cropName: CropName.SUNFLOWER,
    }) as Sunflower;
    const saved = await repository.save(crop);
    return this._addImageUrlToCrop(saved);
  }

  async updateTenderCoconut(
    id: string,
    dto: UpdateTenderCoconutDto,
  ): Promise<TenderCoconut> {
    const repository = this.getRepository<TenderCoconut>(
      CropName.TENDER_COCONUT,
    );
    const crop = await repository.findOne({
      where: { id },
      relations: ['farm', 'farm.user'],
    });
    if (!crop)
      throw new NotFoundException(`tender coconut with id ${id} not found`);
    Object.assign(crop, dto);
    return repository.save(crop);
  }

  async updateTurmeric(id: string, dto: UpdateTurmericDto): Promise<Turmeric> {
    const repo = this.getRepository<Turmeric>(CropName.TURMERIC);
    const crop = await repo.findOne({ where: { id } });
    if (!crop) throw new NotFoundException(`turmeric with id ${id} not found`);
    Object.assign(crop, dto);
    return repo.save(crop);
  }

  async updateBanana(id: string, dto: UpdateBananaDto): Promise<Banana> {
    const repo = this.getRepository<Banana>(CropName.BANANA);
    const crop = await repo.findOne({ where: { id } });
    if (!crop) throw new NotFoundException(`banana with id ${id} not found`);
    Object.assign(crop, dto);
    return repo.save(crop);
  }

  async updateDryCoconut(
    id: string,
    dto: UpdateDryCoconutDto,
  ): Promise<DryCoconut> {
    const repo = this.getRepository<DryCoconut>(CropName.DRY_COCONUT);
    const crop = await repo.findOne({ where: { id } });
    if (!crop)
      throw new NotFoundException(`dry coconut with id ${id} not found`);
    Object.assign(crop, dto);
    return repo.save(crop);
  }

  async updateSunflower(
    id: string,
    dto: UpdateSunflowerDto,
  ): Promise<Sunflower> {
    const repo = this.getRepository<Sunflower>(CropName.SUNFLOWER);
    const crop = await repo.findOne({ where: { id } });
    if (!crop) throw new NotFoundException(`sunflower with id ${id} not found`);
    Object.assign(crop, dto);
    return repo.save(crop);
  }

  isValidVariety(cropName: CropName, cropVariety: string): boolean {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return Object.values(TenderCoconutVariety).includes(cropVariety as any);
      case CropName.TURMERIC:
        return Object.values(TurmericVariety).includes(cropVariety as any);
      case CropName.BANANA:
        return Object.values(BananaVariety).includes(cropVariety as any);
      case CropName.DRY_COCONUT:
        return Object.values(DryCoconutVariety).includes(cropVariety as any);
      case CropName.SUNFLOWER:
        return Object.values(SunflowerVariety).includes(cropVariety as any);
      default:
        return false;
    }
  }

  getRepository<T extends CropType>(cropName: CropName): Repository<T> {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return this.tenderCoconutRepoInjected as Repository<T>;
      case CropName.TURMERIC:
        return this.turmericRepoInjected as Repository<T>;
      case CropName.BANANA:
        return this.bananaRepoInjected as Repository<T>;
      case CropName.DRY_COCONUT:
        return this.dryCoconutRepoInjected as Repository<T>;
      case CropName.SUNFLOWER:
        return this.sunflowerRepoInjected as Repository<T>;
      default:
        throw new Error(`repository for crop '${cropName}' not found`);
    }
  }

  async bulkUpdate(updates: BulkUpdate[]): Promise<void> {
    const promises = updates.map(({ id, cropName, ...rest }) => {
      const repository = this.getRepository(cropName);
      return repository.update(id, { ...rest });
    });
    await Promise.all(promises);
  }

  async remove(id: string, cropName: CropName): Promise<void> {
    const crop = await this.findOne(cropName, id);
    if (!crop) throw new NotFoundException(`crop with id ${id} not found`);
    const repository = this.getRepository(cropName);
    await repository.remove(crop as any);
  }

  private getRepositoryByName(cropName: CropName): Repository<any> {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return this.dataSource.getRepository(TenderCoconut);
      case CropName.TURMERIC:
        return this.dataSource.getRepository(Turmeric);
      case CropName.BANANA:
        return this.dataSource.getRepository(Banana);
      case CropName.DRY_COCONUT:
        return this.dataSource.getRepository(DryCoconut);
      case CropName.SUNFLOWER:
        return this.dataSource.getRepository(Sunflower);
      default:
        throw new Error(`No repository found for cropName: ${cropName}`);
    }
  }

  private getFolderByCropName(cropName: CropName): Folders {
    switch (cropName) {
      case CropName.TENDER_COCONUT:
        return Folders.CROPS_TENDER_COCONUT;
      case CropName.TURMERIC:
        return Folders.CROPS_TURMERIC;
      case CropName.BANANA:
        return Folders.CROPS_BANANA;
      case CropName.DRY_COCONUT:
        return Folders.CROPS_DRY_COCONUT;
      case CropName.SUNFLOWER:
        return Folders.CROPS_SUNFLOWER;
      default:
        throw new Error(`No folder mapping found for cropName: ${cropName}`);
    }
  }

  private validateFiles(files: Express.Multer.File[]) {
    if (!files || !files.length) {
      throw new BadRequestException('No files provided for upload');
    }
    for (const f of files) {
      if (!ALLOWED_IMAGE_MIMETYPES.includes(f.mimetype)) {
        throw new BadRequestException(
          `Invalid file type ${f.originalname} - only JPEG/PNG/WEBP are allowed`,
        );
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException(
          `File ${f.originalname} exceeds max file size of ${MAX_FILE_SIZE_BYTES} bytes`,
        );
      }
    }
  }

  async uploadCropImagesAndCoordinates(
    cropName: CropName,
    id: string,
    files: Express.Multer.File[],
    coordinates?: [number, number],
  ) {
    const repository = this.getRepositoryByName(cropName);
    console.log(cropName);

    const crop = await repository.findOne({ where: { id } });
    if (!crop) {
      throw new NotFoundException(`${cropName} with id ${id} not found`);
    }

    this.validateFiles(files);

    const currentImages: string[] = Array.isArray(crop.images)
      ? crop.images
      : [];

    if (currentImages.length + files.length > MAX_IMAGES_PER_CROP) {
      throw new BadRequestException(
        `A crop can have maximum ${MAX_IMAGES_PER_CROP} images. Current images: ${currentImages.length}`,
      );
    }

    const folder = this.getFolderByCropName(cropName);

    const uploadFile = async (file: Express.Multer.File) => {
      try {
        return await this.fileService.upload(file, { folder });
      } catch (err) {
        this.logger.error('file upload failed', err);
        throw new InternalServerErrorException('Failed to upload file');
      }
    };

    let uploadedUrls: string[] = [];
    try {
      const chunks: Express.Multer.File[][] = [];
      for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
        chunks.push(files.slice(i, i + UPLOAD_CONCURRENCY));
      }
      for (const chunk of chunks) {
        const urls = await Promise.all(chunk.map((f) => uploadFile(f)));
        uploadedUrls = uploadedUrls.concat(urls);
      }
    } catch (err) {
      this.logger.error('uploadCropImagesAndCoordinates: upload error', err);
      throw err;
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const repoTx = manager.getRepository(repository.target);

        const cropTx = await repoTx.findOne({ where: { id } });

        if (!cropTx) {
          throw new NotFoundException(
            `${cropName} with id ${id} not found (tx)`,
          );
        }

        if ('images' in cropTx && Array.isArray(cropTx.images)) {
          cropTx.images = [...(cropTx.images || []), ...uploadedUrls];
        }

        if (coordinates && 'cropCoordinates' in cropTx) {
          cropTx.cropCoordinates = {
            type: 'Point',
            coordinates,
          };
        }

        await repoTx.save(cropTx);
      });
    } catch (err) {
      this.logger.error(
        'uploadCropImagesAndCoordinates: db transaction failed',
        err,
      );

      try {
        // if (uploadedUrls.length && this.fileService.deleteMany) {
        //   await this.fileService.deleteMany(uploadedUrls);
        // }
      } catch (cleanupErr) {
        this.logger.warn('cleanup failed for uploaded files', cleanupErr);
      }
      throw new InternalServerErrorException('Failed to save uploaded images');
    }

    const updated = await repository.findOne({ where: { id } });
    return updated;
  }
  async getCropAlerts(farmId: string): Promise<string[]> {
    try {
      const cropTypesWithoutImages = [];

      const tenderCoconuts = await this.tenderCoconutRepoInjected.find({
        where: { farm: { id: farmId } },
        select: ['images'],
      });
      if (
        tenderCoconuts.some((crop) => !crop.images || crop.images.length === 0)
      ) {
        cropTypesWithoutImages.push('TenderCoconut');
      }

      const turmerics = await this.turmericRepoInjected.find({
        where: { farm: { id: farmId } },
        select: ['images'],
      });
      if (turmerics.some((crop) => !crop.images || crop.images.length === 0)) {
        cropTypesWithoutImages.push('Turmeric');
      }

      const bananas = await this.bananaRepoInjected.find({
        where: { farm: { id: farmId } },
        select: ['images'],
      });
      if (bananas.some((crop) => !crop.images || crop.images.length === 0)) {
        cropTypesWithoutImages.push('Banana');
      }

      const dryCoconuts = await this.dryCoconutRepoInjected.find({
        where: { farm: { id: farmId } },
        select: ['images'],
      });
      if (
        dryCoconuts.some((crop) => !crop.images || crop.images.length === 0)
      ) {
        cropTypesWithoutImages.push('DryCoconut');
      }

      const sunflowers = await this.sunflowerRepoInjected.find({
        where: { farm: { id: farmId } },
        select: ['images'],
      });
      if (sunflowers.some((crop) => !crop.images || crop.images.length === 0)) {
        cropTypesWithoutImages.push('Sunflower');
      }

      return cropTypesWithoutImages;
    } catch (error) {
      this.logger.error(
        `Failed to get crop alert names for farm ${farmId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve crop alerts');
    }
  }
}
