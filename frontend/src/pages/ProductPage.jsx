import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client, { errorMessage } from '../api/client.js';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/format.js';

export default function ProductPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const { t, i18n } = useTranslation(); const { user } = useAuth(); const { addItem } = useCart();
  const [product, setProduct] = useState(null); const [quantity, setQuantity] = useState(1); const [notice, setNotice] = useState('');
  useEffect(() => { client.get(`/products/${id}`).then(({ data }) => setProduct(data.data)).catch((error) => setNotice(errorMessage(error))); }, [id]);
  if (!product && !notice) return <Loading />;
  if (!product) return <section className="page section"><div className="container empty-state"><h2>{notice}</h2><Link to="/menu">{t('common.back')}</Link></div></section>;
  const add = async () => { if (!user) return navigate('/login'); try { await addItem(product._id, quantity); navigate('/cart'); } catch (error) { setNotice(errorMessage(error)); } };
  return <section className="page section"><div className="container"><Link className="back-link" to="/menu"><ArrowLeft size={17} />{t('common.back')}</Link><div className="details-grid"><img className="details-image" src={product.image.secure_url} alt={product.name} /><div className="details-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p>{product.description}</p><strong className="details-price">{formatMoney(product.price, i18n.language)}</strong><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={16} /></button></div>{notice && <div className="notice error">{notice}</div>}<button className="button primary wide" onClick={add} disabled={!product.isAvailable || product.stock < 1}>{product.stock ? t('menu.add') : t('menu.unavailable')}</button><small>{product.stock} available</small></div></div></div></section>;
}
