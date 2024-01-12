import { Homepage } from './components/Homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Product from './components/product/Product';
import About from './components/about/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} exact />
        <Route path='/shop' element={<Product />} exact />
        <Route path='/about' element={<About />} exact />
      </Routes>
    </Router>
  );
}

export default App;
