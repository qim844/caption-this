import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import './VideoList.css';

function VideoList(props) {
  const listOfVideos = props.videoList.map((video) => {

    const isSubtitleReady = true; // TODO

    return (
      <div className="video-list__list-item">
        { isSubtitleReady ?       
          <Button variant="contained" color="primary">
            Download Subtitle
          </Button> :  
          <CircularProgress />
        }
        <span class="video-list__list-item-name">Video name goes here</span>
      </div>
    )
  });

  return (
    <>
      <div className="video-list__title">Previous uploads</div>
      <div className="video-list">
        { listOfVideos }
      </div>
    </>
  )
}

export default VideoList;
