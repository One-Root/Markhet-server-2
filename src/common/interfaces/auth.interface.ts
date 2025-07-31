import { User } from '@one-root/markhet-core';

interface AuthData {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

export { AuthData };
