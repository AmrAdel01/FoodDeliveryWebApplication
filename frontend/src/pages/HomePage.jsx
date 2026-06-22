import { ArrowRight, Clock3, Leaf, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [notice, setNotice] = useState('');
  useEffect(() => { client.get('/products?limit=4').then(({ data }) => setProducts(data.data)).catch(() => {}); }, []);
  return <>
    <section className="hero">
      <div className="hero-orb one" /><div className="hero-orb two" />
      <div className="container hero-grid">
        <div className="hero-copy"><span className="eyebrow">{t('hero.eyebrow')}</span><h1>{t('hero.title')}</h1><p>{t('hero.body')}</p><div className="hero-actions"><Link className="button primary" to="/menu">{t('hero.cta')} <ArrowRight size={18} /></Link><a className="button ghost" href="#how">{t('hero.secondary')}</a></div></div>
        <div className="hero-visual">
          <div className="hero-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="A colorful table of fresh dishes" /></div>
          <div className="floating-card"><span>4.9</span><div><strong>Guest favorite</strong><small>Based on 2,400+ meals</small></div></div>
        </div>
      </div>
    </section>
    <section className="section" id="popular"><div className="container"><div className="section-heading"><div><span className="eyebrow">OUR KITCHEN</span><h2>{t('home.popular')}</h2><p>{t('home.popularBody')}</p></div><Link className="arrow-link" to="/menu">{t('hero.cta')} <ArrowRight size={17} /></Link></div>{notice && <div className="notice error">{notice}</div>}<div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} onError={setNotice} />)}</div></div></section>
    <section className="values section" id="how"><div className="container"><div className="center-heading"><span className="eyebrow">WHY TABLE & THYME</span><h2>{t('home.values')}</h2></div><div className="value-grid"><Value icon={<Leaf />} title={t('home.fresh')} body={t('home.freshBody')} /><Value icon={<Clock3 />} title={t('home.quick')} body={t('home.quickBody')} /><Value icon={<ReceiptText />} title={t('home.easy')} body={t('home.easyBody')} /></div></div></section>
  </>;
}

function Value({ icon, title, body }) { return <article className="value-card"><span>{icon}</span><h3>{title}</h3><p>{body}</p></article>; }
