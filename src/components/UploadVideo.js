import "./UploadVideo.css";
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

/**
 * awaiting file upload
 */
function AwaitUpload() {
  return (
    <div className="await-upload">
      <IconButton aria-label="delete">
        <AddIcon fontSize={"large"} />
      </IconButton>
      <span className="await-upload__label">Upload video</span>  
      <div className="await-upload__instruction">
        <span>Supported formats: </span>
        <span>Max file size: </span>
      </div>
    </div>
  )
}

function UploadVideo() {

  return (
    <div className="upload-video">
      <AwaitUpload />
    </div>
  );
}

export default UploadVideo;