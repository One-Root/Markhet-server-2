import { IsInt, IsEnum, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import { CallCategory } from '../../../common/enums/call.enum';

import { toNumber } from '../../../common/utils/type-converters.util';

export class GetCallsQueryParamsDto {
  @IsOptional()
  @IsEnum(CallCategory)
  category: CallCategory;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 10)
  limit: number = 10;
}
