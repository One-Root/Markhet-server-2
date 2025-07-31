import { Request } from 'express';

import { User } from '@one-root/markhet-core';

interface CustomRequest extends Request {
  user: User;
  fromCache: boolean;
}

export { CustomRequest };
