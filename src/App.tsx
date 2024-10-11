import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AnimeList from './components/AnimeList';
import AnimeDetail from './components/AnimeDetails';
import WatchLater from './components/WatchLater'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnimeList />} />
        <Route path="/anime/:mal_id" element={<AnimeDetail />} />
        <Route path="/watch-later" element={<WatchLater />} /> 
      </Routes>
    </Router>
  );
}

export default App;