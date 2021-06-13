import Branding from "./components/Branding";
import UploadVideo from "./components/UploadVideo";
import "./MainPage.css";

function MainPage() {
  return (
    <main className="main-page">
      <Branding />
      <UploadVideo />
      <amplify-sign-out button-text="Sign Out"></amplify-sign-out>
    </main>
  )
}

export default MainPage;
