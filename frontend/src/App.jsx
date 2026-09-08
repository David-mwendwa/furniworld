import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout.jsx';
import {
  ProtectedRoute,
  ShopperRoute,
  AdminRoute,
  GuestRoute,
} from './components/auth/guards.jsx';

import Home from './pages/Home.jsx';

import { lazy, Suspense } from 'react';

/*
 * Only Home is imported eagerly.
 *
 * Static-importing the rest would put the entire shop in the single chunk a
 * first-time visitor downloads to look at the home page: the checkout and its
 * Stripe SDK, the account area, and all nine admin screens, which no shopper
 * can even reach. That build is one 473KB file against 293KB split.
 *
 * Home stays eager because it is the landing route, and making it a chunk
 * would only add a round trip before the first paint it exists to produce.
 */
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout.jsx'));
const AccountOrders = lazy(() => import('./pages/account/Orders.jsx'));
const AccountOrderDetail = lazy(() => import('./pages/account/OrderDetail.jsx'));
const MyReviews = lazy(() => import('./pages/account/MyReviews.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/Overview.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/Products.jsx'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail.jsx'));
const AdminPayments = lazy(() => import('./pages/admin/Payments.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/Users.jsx'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews.jsx'));

// Pages that export several components share one chunk each — they are small,
// and splitting a two-component file three ways costs more in requests than
// it saves in bytes.
const ForgotPassword = lazy(() => import('./pages/PasswordReset.jsx').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/PasswordReset.jsx').then((m) => ({ default: m.ResetPassword })));
const About = lazy(() => import('./pages/StaticPages.jsx').then((m) => ({ default: m.About })));
const Services = lazy(() => import('./pages/StaticPages.jsx').then((m) => ({ default: m.Services })));
const Contact = lazy(() => import('./pages/StaticPages.jsx').then((m) => ({ default: m.Contact })));
const Profile = lazy(() => import('./pages/account/Profile.jsx').then((m) => ({ default: m.Profile })));
const Password = lazy(() => import('./pages/account/Profile.jsx').then((m) => ({ default: m.Password })));

/**
 * Shown while a route's chunk loads.
 *
 * Deliberately not a spinner: these land in tens of milliseconds on a warm
 * connection, and a spinner that flashes for two frames reads as a stall. The
 * reserved height is the part that matters — without it the footer jumps up to
 * meet the header for as long as the chunk is in flight.
 */
const RouteFallback = () => (
  <div className="min-h-[60vh]" role="status" aria-live="polite">
    <span className="sr-only">Loading…</span>
  </div>
);




const App = () => (
  <Suspense fallback={<RouteFallback />}>
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

      <Route element={<ShopperRoute />}>
        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/success/:orderNumber" element={<OrderSuccess />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route element={<ShopperRoute />}>
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:orderNumber" element={<AccountOrderDetail />} />
          </Route>
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
  </Suspense>
);

export default App;
