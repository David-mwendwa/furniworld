import { Homepage } from './components/Homepage';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Product from './components/product/Product';
import About from './components/about/About';
import Services from './components/services/Services';
import Contact from './components/contact/Contact';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import ThankYou from './components/thankyou/ThankYou';
import Login from './components/user/Login';
import Register from './components/user/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
    children: [
      // { index: true, element: <Homepage /> },
      // { path: 'login', element: <Login /> },
      // { path: 'register', element: <Register /> },
      // { path: 'shop', element: <Product /> },
      // { path: 'about', element: <About /> },
      // { path: 'services', element: <Services /> },
      // { path: 'contact', element: <Contact /> },
      // { path: 'cart', element: <Cart /> },
      // { path: 'checkout', element: <Checkout /> },
      // { path: 'thankyou', element: <ThankYou /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/shop', element: <Product /> },
  { path: '/about', element: <About /> },
  { path: '/services', element: <Services /> },
  { path: '/contact', element: <Contact /> },
  { path: '/cart', element: <Cart /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/thankyou', element: <ThankYou /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
