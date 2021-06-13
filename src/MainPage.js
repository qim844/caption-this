import Branding from "./components/Branding";
import UploadVideo from "./components/UploadVideo";
import VideoList from "./components/VideoList";
import "./MainPage.css";

function MainPage() {
  return (
    <main className="main-page">
      <Branding />
      <UploadVideo />
      <VideoList videoList={Array(5).fill(0)} />
      <amplify-sign-out button-text="Sign Out"></amplify-sign-out>
    </main>
  )
}

export default MainPage;
