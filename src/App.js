import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileRankingPage from './ProfileRankingPage';
import PlayerHistoryPage from './PlayerHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileRankingPage />} />
        <Route path="/player/:id/history" element={<PlayerHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
