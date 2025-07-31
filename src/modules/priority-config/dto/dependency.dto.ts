import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';

import {
  DependencyType,
  DependencyOperator,
} from '../../../common/enums/priority-config.enum';
import { DependencyValueType } from '../../../common/types/priority-config.type';
import { IsValidDependencyValue } from '../../../common/decorators/is-valid-dependency-type.decorator';

export class DependencyDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsEnum(DependencyType)
  type: DependencyType;

  @IsNumber()
  score: number;

  @IsValidDependencyValue()
  value: DependencyValueType;

  @IsEnum(DependencyOperator)
  operator: DependencyOperator;
}
