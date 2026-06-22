import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductPage from './pages/ProductPage.jsx';

export default function App() {
  return <Routes><Route element={<MainLayout />}><Route index element={<HomePage />} /><Route path="menu" element={<MenuPage />} /><Route path="menu/:id" element={<ProductPage />} /><Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} /><Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} /><Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} /><Route path="admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} /><Route path="*" element={<NotFoundPage />} /></Route><Route path="login" element={<AuthPage mode="login" />} /><Route path="register" element={<AuthPage mode="register" />} /></Routes>;
}
