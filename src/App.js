// import logo from './logo.svg';
import './App.css';
import { RecoilRoot } from 'recoil';
import MainPage from './MainPage';
import LandingPage from './LandingPage';

function App() {
  const loggedIn = true; // TODO replace with auth logic

  const content = loggedIn ? <MainPage /> : <LandingPage />

  return (
    <RecoilRoot>
      <div className="App">
        {content}
        
      </div>
    </RecoilRoot>
  );
}

export default App;
