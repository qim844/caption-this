import React, { useRef, useState } from 'react';
import './UploadVideo.css';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { Storage } from 'aws-amplify';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import authenticatedUserState from '../recoils/authenticatedUserState';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MAX_FILE_SIZE_IN_MB,
} from '../constants/supportedFiles';
import Alert from '@material-ui/lab/Alert';
import videoUuIdState from '../recoils/videoUuidState';
import pollingState from '../recoils/pollingState';

function createUploadFilePath(username, filename) {
  return `${username}/${filename}`;
}

const fileUploadsAccept = SUPPORTED_FILE_TYPES.join(',');
const isFileSizeValid = (file) =>
  file.size <= SUPPORTED_MAX_FILE_SIZE_IN_MB * 1000 * 1000;

/**
 * file upload
 */
function AwaitUpload() {
  const [uploading, setUploading] = useState(false);
  const [, setUuid] = useRecoilState(videoUuIdState);
  const [isUploadedVideoValid, setUploadedVideoValid] = useState(true);
  const [currentProgress, setProgress] = useState(0);
  const setPollingState = useSetRecoilState(pollingState);
  const fileInput = useRef(null);

  const onAddVideoButtonClick = () => {
    fileInput.current.click();
  };
  const authedUser = useRecoilValue(authenticatedUserState);

  const onChange = async (e) => {
    if (!e.target.files[0]) return;

    const file = e.target.files[0];

    if (!isFileSizeValid(file)) {
      setUploadedVideoValid(false);
      return;
    }

    setUploadedVideoValid(true);
    setUploading(true);
    await Storage.put(
      createUploadFilePath(authedUser.username, file.name),
      file,
      {
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          setProgress(Math.round((100 * progress.loaded) / progress.total));
        },
      }
    );
    setUploading(false);
    setTimeout(() => {
      console.log(
        'video upload complete. starting polling for transcribe job completion'
      );
      setUuid((uuid) => uuid + 1);
      setPollingState(true);
    }, 1000);
  };

  function ChooseFile() {
    return (
      <>
        <IconButton
          aria-label="upload video"
          onClick={onAddVideoButtonClick}
          disabled={uploading}
        >
          <AddIcon fontSize={'large'} />
        </IconButton>
        <input
          type="file"
          id="file"
          onChange={onChange}
          ref={fileInput}
          style={{ display: 'none' }}
          accept={fileUploadsAccept}
        />
        {!isUploadedVideoValid && (
          <Alert severity="error">
            Selected video is too large. Max size allowed is {' '}
            {SUPPORTED_MAX_FILE_SIZE_IN_MB} MB
          </Alert>
        )}
        <span className="await-upload__label">Upload Video</span>
        <div className="await-upload__instruction">
          <span>Supported formats: {fileUploadsAccept} </span>
          <span>Max file size: {SUPPORTED_MAX_FILE_SIZE_IN_MB} MB</span>
        </div>
      </>
    );
  }

  return (
    <div className="await-upload">
      <ChooseFile />
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={currentProgress}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
}

function UploadVideo() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="upload-video">
        <AwaitUpload />
      </div>
    </React.Suspense>
  );
}

export default UploadVideo;
