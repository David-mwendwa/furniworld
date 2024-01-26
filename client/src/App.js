import { Homepage } from './components/Homepage';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Product from './components/Product';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';
import Login from './components/user/Login';
import Register from './components/user/Register';
import PasswordReset from './components/user/PasswordReset';
import PasswordForgot from './components/user/PasswordForgot';

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
  { path: '/password-forgot', element: <PasswordForgot /> },
  { path: '/password-reset/:token', element: <PasswordReset /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
