enum CropTable {
  TENDER_COCONUT = 'tender_coconut',
  TURMERIC = 'turmeric',
  BANANA = 'banana',
  DRY_COCONUT = 'dry_coconut',
  SUNFLOWER = 'sunflower',
  MAIZE = 'maize',
}

// enums representing crop  varieties
enum TenderCoconutVariety {
  NAATI = 'Naati',
  DEEJAY = 'Deejay',
  ORANGE = 'Orange',
  COD = 'COD',
  TNT = 'TNT',
  GANGA_BONDAM = 'Ganga Bondam',
  MALAYSIAN_DWARF = 'Malaysian Dwarf',
  KALPARAKSHA = 'Kalparaksha',
  CHOWGHAT_ORANGE = 'Chowghat Orange',
  TIPTUR_TALL = 'Tiptur Tall',
  MOD = 'MOD',
  AGT = 'AGT',
}

enum TurmericVariety {
  SALEM = 'Salem',
  ERODE = 'Erode',
  SANGLI = 'Sangli',
  MARATHWADA = 'Marathwada',
  VIZAG = 'Vizag',
  NIZAMABAD = 'Nizamabad',
  CHAMARAJANAGAR = 'Chamarajanagar',
}

enum BananaVariety {
  NENDRA = 'Nendra',
  RED = 'Red',
  YELLAKI = 'Yelakki',
  G9 = 'G9',
}

enum DryCoconutVariety {
  NAATI = 'Naati',
  DEEJAY = 'Deejay',
  ORANGE = 'Orange',
  COD = 'COD',
  TNT = 'TNT',
  GANGA_BONDAM = 'Ganga Bondam',
  MALAYSIAN_DWARF = 'Malaysian Dwarf',
  KALPARAKSHA = 'Kalparaksha',
  CHOWGHAT_ORANGE = 'Chowghat Orange',
  TIPTUR_TALL = 'Tiptur Tall',
  MOD = 'MOD',
  AGT = 'AGT',
}
enum SunflowerVariety {
  COMMON = 'Common',
  GIANT = 'Giant',
  DWARF = 'Dwarf',
  TALL = 'Tall',
  SUNRAY = 'Sunray',
  SUNSPOT = 'Sunspot',
  SUNBURST = 'Sunburst',
  SUNPOWER = 'Sunpower',
}
enum MaizeVariety {
  NORMAL = 'Normal',
  WHITE = 'White',
}

enum CropStatusEnum {
  FARMER_REPORTED = 'Farmer Reported',
  MAYBE_READY = 'Maybe Ready',
  PAKKA_READY = 'Pakka Ready',
  NOT_READY = 'Not Ready',
}

enum CropReportedByEnum {
  FARMER = 'Farmer',
  SYSTEM = 'System',
  SUPPORT = 'Support',
}

export {
  CropTable,
  BananaVariety,
  TurmericVariety,
  DryCoconutVariety,
  TenderCoconutVariety,
  SunflowerVariety,
  MaizeVariety,
  CropStatusEnum,
  CropReportedByEnum,
};
