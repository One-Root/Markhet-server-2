const excludeKeys = new Set([
  'id',
  'message',
  'language',
  'fcmToken',
  'deviceId',
  'identity',
]);

const excludeTypes = new Set([Date, Number, Boolean]);

export { excludeKeys, excludeTypes };
