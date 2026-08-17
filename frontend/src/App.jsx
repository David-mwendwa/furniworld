import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout.jsx';
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from './components/auth/guards.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { ForgotPassword, ResetPassword } from './pages/PasswordReset.jsx';
import { About, Services, Contact } from './pages/StaticPages.jsx';
import NotFound from './pages/NotFound.jsx';

import AccountLayout from './pages/account/AccountLayout.jsx';
import AccountOrders from './pages/account/Orders.jsx';
import AccountOrderDetail from './pages/account/OrderDetail.jsx';
import MyReviews from './pages/account/MyReviews.jsx';
import { Profile, Password } from './pages/account/Profile.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/Overview.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminProductForm from './pages/admin/ProductForm.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetail from './pages/admin/OrderDetail.jsx';
import AdminPayments from './pages/admin/Payments.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminReviews from './pages/admin/Reviews.jsx';

const App = () => (
  <Routes>
    <Route element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="shop" element={<Shop />} />
      <Route path="shop/:category" element={<Shop />} />
      <Route path="product/:slug" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />

      <Route path="about" element={<About />} />
      <Route path="services" element={<Services />} />
      <Route path="contact" element={<Contact />} />

      <Route element={<GuestRoute />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/success/:orderNumber" element={<OrderSuccess />} />

        <Route path="account" element={<AccountLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:orderNumber" element={<AccountOrderDetail />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<Password />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
