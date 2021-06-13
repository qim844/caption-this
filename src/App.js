import React from 'react';
import './App.css';
import { withAuthenticator} from '@aws-amplify/ui-react';
import MainPage from './MainPage';

function App() {
  return (
    <div className="App">
        <MainPage />
    </div>
  );
}

export default withAuthenticator(App);
