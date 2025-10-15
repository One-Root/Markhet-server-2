enum Language {
  EN = 'en',
  KN = 'kn',
  TA = 'ta',
  TE = 'te',
  HI = 'hi',
}

enum Identity {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  SUPPORT = 'SUPPORT',
  SYSTEM = 'SYSTEM',
}

enum PaymentMode {
  UPI = 'UPI',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

enum UserPlanEnum {
  FREE = "FREE",
  PREMIUM = "PREMIUM"
}

export { Language, Identity, PaymentMode, UserPlanEnum };
