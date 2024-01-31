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
import PasswordForgot from './components/user/PasswordForgot';
import PasswordReset from './components/user/PasswordReset';
import Profile from './components/user/Profile';
import HomeLayout from './components/HomeLayout';
import Landing from './components/Landing';

// ADMIN COMPONENTS
import DashboardLayout from './dashboard/layout/DashboardLayout';
import NewProduct from './dashboard/admin/NewProduct';
import Stats from './dashboard/admin/Stats';
import OrdersList from './dashboard/admin/OrdersList';
import AdminProfile from './dashboard/admin/Profile';
import ProductsList from './dashboard/admin/ProductsList';
import UsersList from './dashboard/admin/UsersList';
import OrderDetails from './dashboard/admin/OrderDetails';
import EditUser from './dashboard/admin/EditUser';

import { action as registerAction } from './components/user/Register';
import { loader as dashboardLoader } from './dashboard/layout/DashboardLayout';

const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  return isDarkTheme;
};
const isDarkThemeEnabled = checkDefaultTheme();

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <h1>ERROR</h1>,
    children: [
      { index: true, element: <Landing /> },
      { path: 'register', element: <Register />, action: registerAction },
      { path: 'login', element: <Login /> },
      { path: 'shop', element: <Product /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'thankyou', element: <ThankYou /> },
      { path: 'profile', element: <Profile /> },
      { path: 'password-forgot', element: <PasswordForgot /> },
      { path: 'password-reset/:token', element: <PasswordReset /> },
      {
        path: 'dashboard',
        element: <DashboardLayout isDarkThemeEnabled={isDarkThemeEnabled} />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            element: <Stats />,
          },
          {
            path: 'products',
            element: <ProductsList />,
            errorElement: <h3>ERROR</h3>,
          },
          {
            path: 'new-product',
            element: <NewProduct />,
          },
          {
            path: 'users',
            element: <UsersList />,
            errorElement: <h3>ERROR</h3>,
          },
          {
            path: 'user/:id',
            element: <EditUser />,
            errorElement: <h3>ERROR</h3>,
          },
          {
            path: 'orders',
            element: <OrdersList />,
            errorElement: <h3>ERROR</h3>,
          },
          {
            path: 'order/:id',
            element: <OrderDetails />,
            errorElement: <h3>ERROR</h3>,
          },
          {
            path: 'profile',
            element: <AdminProfile />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
