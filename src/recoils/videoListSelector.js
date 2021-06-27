import { selector } from 'recoil';
import videoUuIdState from './videoUuidState';
import authenticatedUserState from './authenticatedUserState';
import { Storage } from 'aws-amplify';
import { S3_SRT_BUCKET, S3_VIDEO_BUCKET } from '../constants/buckets';

const videoListAsyncSelector = selector({
  key: 'videoListAsync',
  get: async ({ get }) => {
    try {
      const authedUser = await get(authenticatedUserState);
      const uuid = get(videoUuIdState);
      const username = authedUser.username;
      console.log(`uuid: ${uuid}`);
      if (!username) {
        console.log('no username');
        return [];
      }

      const [uploadedVideos, srtSubtitles, transcribedVideos] =
        await Promise.all([
          Storage.list(`${username}/`),
          Storage.list(`${username}/`, { bucket: S3_SRT_BUCKET }),
          Storage.list(`${username}/`, { bucket: S3_VIDEO_BUCKET }),
        ]);
      uploadedVideos.forEach((video) => {
        const fileNameWithoutExtension = video.key.substr(
          0,
          video.key.lastIndexOf('.')
        );
        if (
          srtSubtitles.some(
            (subtitleFile) =>
              subtitleFile.key === `${fileNameWithoutExtension}.srt`
          )
        ) {
          video.subtitleReady = true;
          video.subtitleKey = `${fileNameWithoutExtension}.srt`;
          video.fileNameWithoutExtension = fileNameWithoutExtension;
          video.fileName = video.key.substr(username.length + 1);
        }

        if (
          transcribedVideos.some(
            (transcribedVideoFile) => transcribedVideoFile.key === video.key
          )
        ) {
          video.transcribedVideoFileReady = true;
          video.fileNameWithoutExtension = fileNameWithoutExtension;
          video.fileName = video.key.substr(username.length + 1);
        }
      });

      return uploadedVideos;
    } catch (error) {
      console.log(error);
      return [];
    }
  },
});

export default videoListAsyncSelector;
