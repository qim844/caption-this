import React, { useRef, useState } from 'react';
import "./UploadVideo.css";
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { Storage } from 'aws-amplify';
import { useRecoilValue } from 'recoil';
import userNameQuery from '../recoils/userNameQuery'
import LinearProgress from '@material-ui/core/LinearProgress';

function createUploadFilePath(username, filename) {
    return `${username}/${filename}`;
}

/**
 * file upload
 */
function AwaitUpload() {
  const [ uploading, setUploading ] = useState(false);
  const [ currentProgress, setProgress ] = useState(0);
  const fileInput = useRef(null);
  
  const onAddVideoButtonClick = () => {
    fileInput.current.click();
  };
  const username = useRecoilValue(userNameQuery);

  const  onChange = async (e) => {
    if(!e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    await Storage.put(createUploadFilePath(username, file.name), file, {
      progressCallback(progress) {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        setProgress(Math.round(100*progress.loaded/progress.total))
      }
    });
    setUploading(false);
    alert('Upload successful')
  }

  function ChooseFile() {
    return (
      <>
        <IconButton aria-label="upload video" onClick={onAddVideoButtonClick} disabled={uploading}>
          <AddIcon fontSize={"large"} />
        </IconButton>
        <input type='file' id='file' onChange={onChange} ref={fileInput} style={{ display: 'none' }} />
        <span className="await-upload__label">Upload video</span>  
        <div className="await-upload__instruction">
          <span>Supported formats: </span>
          <span>Max file size: </span>
        </div>
      </>
    )
  }
  
  return ( 
    <div className="await-upload">
      <ChooseFile /> 
      { uploading && <LinearProgress variant="determinate" value={currentProgress} style={{ width: '100%' }}/> }
    </div>
  )
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