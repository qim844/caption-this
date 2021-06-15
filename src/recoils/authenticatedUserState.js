import { atom } from 'recoil';

const authenticatedUserState = atom({
  key: 'authenticatedUserState',
  default: {},
});

export default authenticatedUserState;
