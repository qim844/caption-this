import { Storage } from 'aws-amplify';
import React, { useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useRecoilState, useRecoilValue } from 'recoil';
import videoListAsyncSelector from '../recoils/videoListSelector';
import videoUuIdState from '../recoils/videoUuidState';
import useInterval from '../hooks/useInterval';
import { S3_SRT_BUCKET, S3_VIDEO_BUCKET } from '../constants/buckets';
import './VideoList.css';
import pollingState from '../recoils/pollingState';

function ListOfVideos({ downloadOverlayVideo, downloadSubtitle }) {
  const videoList = useRecoilValue(videoListAsyncSelector);
  const [videoUuid, setUuid] = useRecoilState(videoUuIdState);
  const [isRunning, setPollingState] = useRecoilState(pollingState);

  const conitnuePolling = () => {
    return !videoList.every((video) => {
      return video.subtitleReady && video.transcribedVideoFileReady;
    });
  };

  useInterval(
    () => {
      setUuid((uuid) => uuid + 1);
      const continuePoll = conitnuePolling();
      if (!continuePoll) {
        setPollingState(false);
      }
    },
    isRunning ? 5000 : null
  );

  return (videoList || []).map((video, i) => {
    return (
      <div className="video-list__list-item" key={video.key + videoUuid}>
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
}

function VideoListAsync() {
  const downloadEle = useRef(null);
  const [downloadLink, setDownloadLink] = useState('');

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

  return (
    <React.Suspense fallback={<CircularProgress />}>
      <div className="video-list">
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
        <ListOfVideos
          downloadSubtitle={downloadSubtitle}
          downloadOverlayVideo={downloadOverlayVideo}
        />
      </div>
    </React.Suspense>
  );
}

export default VideoListAsync;
