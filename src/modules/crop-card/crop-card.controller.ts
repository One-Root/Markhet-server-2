import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { CropCardService } from './crop-card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';
import {
  CropCardData,
  CropCardUpdateData,
} from '../../common/types/crop-card.type';
import { CropName } from 'src/common/enums/farm.enum';

@Controller('crop-cards')
@UseGuards(JwtAuthGuard, SessionGuard)
export class CropCardController {
  constructor(private readonly cropCardService: CropCardService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: CustomRequest) {
    const cards = await this.cropCardService.getFarmerActiveCropCards(
      req.user.id,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'Dashboard crop cards retrieved successfully',
      { cards },
    );
  }

  @Post(':cropId')
  async createCropCard(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Query('cropName') cropName: CropName,
    @Req() req: CustomRequest,
  ) {
    const farmerId = req.user.id;

    const newCard = await this.cropCardService.createCropCard(
      farmerId,
      cropId,
      cropName,
    );
    return new ApiResponse(
      HttpStatus.CREATED,
      'Crop card created successfully',
      newCard,
    );
  }

  @Patch(':cardId')
  async updateCropCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body(new ValidationPipe()) update: CropCardUpdateData,
    @Req() req: CustomRequest,
  ) {
    const updated = await this.cropCardService.updateCropCard(
      cardId,
      req.user.id,
      update,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'Crop card updated successfully',
      updated,
    );
  }

  @Get(':cardId')
  async getCropCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Req() req: CustomRequest,
  ) {
    const card = await this.cropCardService.findCropCardById(
      cardId,
      req.user.id,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'Crop card retrieved successfully',
      card,
    );
  }

  @Post(':cardId/interested')
  async expressInterest(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Req() request: CustomRequest,
  ) {
    const buyerId = request.user.id;
    const result = await this.cropCardService.expressInterest(cardId, buyerId);

    const statusCode = result.success ? HttpStatus.OK : HttpStatus.CONFLICT;

    return new ApiResponse(statusCode, result.message, {
      interestedBuyersCount: result.interestedBuyersCount,
      success: result.success,
    });
  }

  @Delete(':cardId/interested')
  async removeInterest(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Req() request: CustomRequest,
  ) {
    const buyerId = request.user.id;
    const result = await this.cropCardService.removeInterest(cardId, buyerId);

    return new ApiResponse(HttpStatus.OK, result.message, {
      interestedBuyersCount: result.interestedBuyersCount,
    });
  }

  @Get(':cardId/interested-buyers')
  async getInterestedBuyers(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Req() request: CustomRequest,
  ) {
    const farmerId = request.user.id;
    const interestedBuyers = await this.cropCardService.getInterestedBuyers(
      cardId,
      farmerId,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'Interested buyers retrieved successfully',
      { buyers: interestedBuyers },
    );
  }
}
