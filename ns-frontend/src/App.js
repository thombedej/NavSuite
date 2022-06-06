import './App.scss';
import NavBar from './components/NavBar/NavBar';
import './customTheme.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard/Dashboard';
import GetData from './components/Pages/GetData/GetData';
import About from './components/Pages/About/About';
import Landing from './components/Pages/Landing/Landing';
import Animated from './components/Animated';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import grey from '@mui/material/colors/grey';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f81eb',
      darker: '#2958a4',
      light: '#5798ff'
    },
    secondary: {
      main: '#ffffff',
      darker: '#c0c0c0',
      contrastText: '#000'
    },
  },
});

export const PRIMARY_COLOR = '#3f81eb'

// export const SERVER_IP = 'http://192.168.0.130'
export const SERVER_IP = 'https://nav-suite.azurewebsites.net';
export const SERVER_URL = `${SERVER_IP}/server`;
// export const SERVER_IP = 'https://nav-suite.azurewebsites.net' 

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
          <div style={{
            width: '200px',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            // display: 'flex',
            // alignItems: 'center',
            // marginLeft:'10px',
            zIndex: 9999
          }}>
            <NavBar />
          </div>
          <div style={{ marginLeft: '180px', overflow: 'hidden' }}>
            <Switch>
              <Route path="/about">
                <Animated delay={0} enterDuration={350}>
                  <About />
                </Animated>
              </Route>
              <Route path="/data">
                <Animated delay={0} enterDuration={350}>
                  <GetData />
                </Animated>
              </Route>
              <Route path="/dashboard">
                <Animated delay={0} enterDuration={350}>
                  <Dashboard />
                </Animated>
              </Route>
              <Route path="/">
                <Landing />
              </Route>
              {/* <Route path="/">
          </Route> */}
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
      {/* <div style={{ width: '100%', height: '100px', backgroundColor: '#1c1c1c', marginTop: '100px' }}></div> */}
    </div>
  );
}

export default App;
