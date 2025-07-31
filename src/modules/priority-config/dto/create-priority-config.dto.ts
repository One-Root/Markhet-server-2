import { IsEnum, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

import { DependencyDto } from './dependency.dto';

import {
  ConfigEntity,
  ConfigRelation,
} from '../../../common/enums/priority-config.enum';

export class CreatePriorityConfigDto {
  @IsEnum(ConfigEntity)
  entity: ConfigEntity;

  @IsEnum(ConfigRelation)
  relation: ConfigRelation;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => DependencyDto)
  @ValidateNested({ each: true })
  dependencies: DependencyDto[];
}
