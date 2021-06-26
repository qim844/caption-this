import React, { useRef, useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import './VideoList.css';
import authenticatedUserState from '../recoils/authenticatedUserState';
import { useRecoilValue, useRecoilState } from 'recoil';
import videoListState from '../recoils/videoListState';
import Tooltip from '@material-ui/core/Tooltip';
import { Storage } from 'aws-amplify';
import { S3_SRT_BUCKET, S3_VIDEO_BUCKET } from '../constants/buckets';

function VideoList() {
  const [videoList, setVideoList] = useRecoilState(videoListState);
  const { username } = useRecoilValue(authenticatedUserState);
  const downloadEle = useRef(null);
  const [downloadLink, setDownloadLink] = useState('');

  async function loadVideos() {
    console.log('listing videos ');
    const [uploadedVideos, srtSubtitles, transcribedVideos] = await Promise.all(
      [
        Storage.list(`${username}/`),
        Storage.list(`${username}/`, { bucket: S3_SRT_BUCKET }),
        Storage.list(`${username}/`, { bucket: S3_VIDEO_BUCKET }),
      ]
    );

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
    setVideoList(uploadedVideos);
  }

  async function downloadOverlayVideo(video) {
    const signedURL = await Storage.get(video.key, {
      bucket: S3_VIDEO_BUCKET,
    });
    setDownloadLink(signedURL);
    downloadEle.current.click();
  }

  async function downloadSubtitle(video) {
    const signedURL = await Storage.get(
      `${video.fileNameWithoutExtension}.srt`,
      {
        bucket: S3_SRT_BUCKET,
      }
    );
    setDownloadLink(signedURL);
    downloadEle.current.click();
  }

  const listOfVideos = (videoList || []).map((video) => {
    return (
      <div className="video-list__list-item" key={video.key}>
        {video.subtitleReady ? (
          <Button
            variant="contained"
            color="primary"
            style={{ margin: '10px auto' }}
            onClick={() => downloadSubtitle(video)}
          >
            Download Subtitle
          </Button>
        ) : (
          <Tooltip title="Processing your subtitle" aria-label="add">
            <CircularProgress />
          </Tooltip>
        )}
        {video.transcribedVideoFileReady ? (
          <Button
            variant="contained"
            color="primary"
            style={{ margin: '10px auto' }}
            onClick={() => downloadOverlayVideo(video)}
          >
            Download Video
          </Button>
        ) : (
          <Tooltip title="Processing your video" aria-label="add">
            <CircularProgress />
          </Tooltip>
        )}
        <span className="video-list__list-item-name">{video.fileName}</span>
      </div>
    );
  });

  return (
    <>
      <a
        download
        ref={downloadEle}
        href={downloadLink}
        style={{ display: 'none' }}
        target="_blank"
        rel="noreferrer"
      >
        download
      </a>
      <div className="video-list__title">Previous uploads</div>
      <button onClick={loadVideos}>refresh video list (temp)</button>
      <div className="video-list">{listOfVideos}</div>
    </>
  );
}

export default VideoList;
