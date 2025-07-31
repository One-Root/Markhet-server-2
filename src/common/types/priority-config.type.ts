import { User } from '@one-root/markhet-core';

import { CropType } from './crop.type';
import {
  DependencyType,
  DependencyOperator,
} from '../enums/priority-config.enum';

type Dependency = {
  key: string;
  type: DependencyType;
  score: number;
  value: DependencyValueType;
  operator: DependencyOperator;
};

type ConfigRelationData = User | CropType;

type DependencyValueType = string | number | boolean | Date | string[];

export { Dependency, DependencyValueType, ConfigRelationData };
