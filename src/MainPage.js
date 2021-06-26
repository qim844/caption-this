import { Auth } from 'aws-amplify';
import Branding from './components/Branding';
import UploadVideo from './components/UploadVideo';
import VideoListAsync from './components/VideoListAsync';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import authenticatedUserState from './recoils/authenticatedUserState';
import './MainPage.css';

function MainPage() {
  const [authedUser, setAuthedUser] = useRecoilState(authenticatedUserState);
  useEffect(() => {
    if (!authedUser.username) {
      Auth.currentAuthenticatedUser().then((user) => {
        setAuthedUser({ username: user.username });
      });
    }
  });

  return (
    <main className="main-page">
      <Branding />
      <UploadVideo />
      <VideoListAsync />
      <amplify-sign-out button-text="Sign Out"></amplify-sign-out>
    </main>
  );
}

export default MainPage;
