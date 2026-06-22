import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import client, { errorMessage } from '../api/client.js';
import Loading from '../components/Loading.jsx';
import ProductCard from '../components/ProductCard.jsx';

const categories = ['Pizza', 'Burgers', 'Pasta', 'Drinks', 'Desserts'];

export default function MenuPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true); setNotice('');
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (category) params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        const { data } = await client.get(`/products?${params}`);
        setProducts(data.data);
      } catch (error) { setNotice(errorMessage(error)); } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [category, search]);

  return <section className="page section"><div className="container"><div className="page-title"><span className="eyebrow">THE FULL MENU</span><h1>{t('menu.title')}</h1><p>{t('menu.subtitle')}</p></div><div className="menu-tools"><label className="search-box"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('menu.search')} /></label><div className="category-tabs"><button className={!category ? 'active' : ''} onClick={() => setCategory('')}>{t('menu.all')}</button>{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{notice && <div className="notice error">{notice}</div>}{loading ? <Loading /> : products.length ? <div className="product-grid"><>{products.map((product) => <ProductCard key={product._id} product={product} onError={setNotice} />)}</></div> : <div className="empty-state"><h3>{t('menu.empty')}</h3></div>}</div></section>;
}
