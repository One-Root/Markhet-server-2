enum CropName {
  TENDER_COCONUT = 'Tender Coconut',
  TURMERIC = 'Turmeric',
  BANANA = 'Banana',
  DRY_COCONUT = 'Dry Coconut',
  SUNFLOWER = 'Sunflower',
  MAIZE = 'Maize',
}

enum CropStatusEnum {
  FARMER_REPORTED = 'Farmer Reported',
  MAYBE_READY = 'Maybe Ready',
  PAKKA_READY = 'Pakka Ready',
}

enum Weather {
  RAINY = 'Rainy',
  SUNNY = 'Sunny',
  CLOUDY = 'Cloudy',
  STORMY = 'Stormy',
}

enum GeoJsonType {
  POINT = 'Point',
}

export { CropName, Weather, GeoJsonType, CropStatusEnum };
