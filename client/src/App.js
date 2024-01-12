import { Homepage } from './components/Homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Product from './components/product/Product';
import About from './components/about/About';
import Services from './components/services/Services';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} exact />
        <Route path='/shop' element={<Product />} exact />
        <Route path='/about' element={<About />} exact />
        <Route path='/services' element={<Services />} exact />
      </Routes>
    </Router>
  );
}

export default App;
