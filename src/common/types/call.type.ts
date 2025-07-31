import { Call } from '@one-root/markhet-core';

type MostRecentCallType = {
  call: Call;
  match: 'from' | 'to';
};

export { MostRecentCallType };
