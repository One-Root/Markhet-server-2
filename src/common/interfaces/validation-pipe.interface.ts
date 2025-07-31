interface PipeOptions {
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  shouldTransform?: boolean;
  skipMissingProperties?: boolean;
  groups?: string[];
  always?: boolean;
  enableDebugMessages?: boolean;
  validationError?: 'strict' | 'minimal' | 'custom';
}

export { PipeOptions };
