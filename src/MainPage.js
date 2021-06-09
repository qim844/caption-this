import Branding from "./components/Branding";
import UploadVideo from "./components/UploadVideo";
import "./MainPage.css";

function MainPage() {
  return (
    <main className="main-page">
      <Branding />
      <UploadVideo />
    </main>
  )
}

export default MainPage;