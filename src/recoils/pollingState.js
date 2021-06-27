import { atom } from 'recoil';

const pollingState = atom({
  key: 'pollingState',
  default: false,
});

export default pollingState;
