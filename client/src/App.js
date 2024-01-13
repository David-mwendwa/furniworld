import { Homepage } from './components/Homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Product from './components/product/Product';
import About from './components/about/About';
import Services from './components/services/Services';
import Blog from './components/blog/Blog';
import Contact from './components/contact/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} exact />
        <Route path='/shop' element={<Product />} exact />
        <Route path='/about' element={<About />} exact />
        <Route path='/services' element={<Services />} exact />
        <Route path='/blog' element={<Blog />} exact />
        <Route path='/contact' element={<Contact />} exact />
      </Routes>
    </Router>
  );
}

export default App;
