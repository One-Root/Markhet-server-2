enum DependencyType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY_STRING = 'array:string',
}

enum DependencyOperator {
  EQ = 'eq',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  CONTAINS = 'contains',
  IN = 'in',
}

enum ConfigEntity {
  // user
  USER = 'USER',

  // crop
  CROP = 'CROP',

  // farm
  FARM = 'FARM',
}

enum ConfigRelation {
  // user
  USER = 'USER',

  // crop
  CROP = 'CROP',

  // crop - farm
  CROP_FARM = 'CROP:FARM',

  // crop - farm - user
  CROP_FARM_USER = 'CROP:FARM:USER',
}

enum CropKey {
  IMAGES = 'images',
  IS_CROP_VERIFIED = 'isVerified',
  IS_READY_TO_HARVEST = 'isReadyToHarvest',
}

enum FarmKey {
  IS_FARM_VERIFIED = 'isVerified',
}

enum UserKey {
  IS_USER_VERIFIED = 'isVerified',
}

export {
  UserKey,
  FarmKey,
  CropKey,
  ConfigEntity,
  ConfigRelation,
  DependencyType,
  DependencyOperator,
};
