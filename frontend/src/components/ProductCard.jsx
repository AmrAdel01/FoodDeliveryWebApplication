import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney, productImage } from '../utils/format.js';

export default function ProductCard({ product, onError }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const add = async () => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product._id); } catch (error) { onError?.(errorMessage(error)); }
  };
  return <article className="product-card">
    <Link className="product-image" to={`/menu/${product._id}`}>
      <img src={productImage(product.image)} alt={product.name} loading="lazy" />
      <span className="category-pill">{product.category}</span>
    </Link>
    <div className="product-body">
      <div><Link to={`/menu/${product._id}`}><h3>{product.name}</h3></Link><p>{product.description}</p></div>
      <div className="product-footer">
        <strong>{formatMoney(product.price, i18n.language)}</strong>
        <button className="icon-button accent" onClick={add} disabled={!product.isAvailable || product.stock === 0} aria-label={t('menu.add')}><Plus size={19} /></button>
      </div>
    </div>
  </article>;
}
