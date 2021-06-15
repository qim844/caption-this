import { atom } from 'recoil';

const videoListState = atom({
  key: 'videoListState',
  default: [],
});

export default videoListState;
