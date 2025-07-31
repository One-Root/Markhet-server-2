import {
  ILike,
  LessThan,
  MoreThan,
  ArrayContains,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

export const applyOperator = (operator: string, value: any) => {
  switch (operator) {
    case 'gte':
      return MoreThanOrEqual(value);

    case 'lte':
      return LessThanOrEqual(value);

    case 'gt':
      return MoreThan(value);

    case 'lt':
      return LessThan(value);

    case 'like':
      return ILike(`%${value}%`);

    case 'contains':
      return ArrayContains(value);

    default:
      return value;
  }
};
