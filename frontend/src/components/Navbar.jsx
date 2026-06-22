import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const links = [
    ['/', t('nav.home')], ['/menu', t('nav.menu')],
    ...(user ? [['/orders', t('nav.orders')]] : []),
    ...(user?.role === 'admin' ? [['/admin', t('nav.admin')]] : []),
  ];
  return <header className="navbar">
    <div className="container nav-inner">
      <Link to="/" className="brand"><span>T</span>Table & Thyme</Link>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
      </nav>
      <div className="nav-actions">
        <button className="language" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}>{i18n.language === 'en' ? 'عربي' : 'EN'}</button>
        {user ? <button className="text-button desktop-only" onClick={logout}>{t('nav.logout')}</button> : <Link className="text-button desktop-only" to="/login">{t('nav.login')}</Link>}
        <Link to="/cart" className="cart-link" aria-label={t('nav.cart')}><ShoppingBag size={21} />{count > 0 && <span>{count}</span>}</Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
  </header>;
}
