import {
  Body,
  Post,
  Param,
  UseGuards,
  HttpStatus,
  Controller,
  BadRequestException,
} from '@nestjs/common';

import { TranslationService } from './translation.service';

import { GetTranslationDto } from './dto/get-translation.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { Language } from '../../common/enums/user.enum';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('translation')
@UseGuards(JwtAuthGuard, SessionGuard)
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post(':language')
  async getReservations(
    @Param('language') language: string,
    @Body() getTranslationDto: GetTranslationDto,
  ): Promise<ApiResponse<string>> {
    if (!Object.values(Language).includes(language as Language))
      throw new BadRequestException(
        `language '${language}' is not supported. supported languages are ${Object.values(Language).join(', ')}.`,
      );

    const { text } = getTranslationDto;

    const translation = await this.translationService.translateText(
      text,
      language,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'translation retrieved successfully',
      translation,
    );
  }
}
