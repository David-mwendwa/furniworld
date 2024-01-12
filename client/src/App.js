import { Homepage } from './components/Homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} exact />
      </Routes>
    </Router>
  );
}

export default App;
