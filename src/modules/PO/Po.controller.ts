import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PoService } from './po.service';
import { AddPOInterestDto } from './dto/add-po.dto';
import { ApiResponse } from 'src/common/interceptors/api-response.interceptor';
import { CustomRequest } from 'src/common/interfaces/express.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';
import { CropName } from 'src/common/enums/farm.enum';

@Controller('po')
@UseGuards(JwtAuthGuard, SessionGuard)
export class PoController {
  private readonly logger = new Logger(PoController.name);

  constructor(private readonly poService: PoService) {}

  @Get()
  async getAll(@Query('cropname') cropname: CropName) {
    const data = await this.poService.getAll(cropname);
    return new ApiResponse(HttpStatus.OK, 'POs retrieved successfully', data);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.poService.getPoById(id);
    return new ApiResponse(HttpStatus.OK, 'Fetched successfully', data);
  }

  @Post('interest')
  @HttpCode(HttpStatus.CREATED)
  async addInterest(@Req() req: CustomRequest, @Body() dto: AddPOInterestDto) {
    const interest = await this.poService.addInterestToPO(dto, req.user.id);
    return new ApiResponse(
      HttpStatus.CREATED,
      'Buyer Intrest added successfully',
      interest,
    );
  }
}
