import { atom } from 'recoil';

const pollingState = atom({
  key: 'pollingState',
  default: true,
});

export default pollingState;
