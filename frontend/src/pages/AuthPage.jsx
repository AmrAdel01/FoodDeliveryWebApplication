import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login'; const { t } = useTranslation(); const auth = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const user = await auth[mode](form); navigate(user.role === 'admin' ? '/admin' : location.state?.from?.pathname || '/menu', { replace: true }); } catch (requestError) { setError(errorMessage(requestError)); } finally { setBusy(false); } };
  return <section className="auth-page"><div className="auth-visual"><div><span className="eyebrow">TABLE & THYME</span><h2>Good food is worth sharing.</h2><p>Your next favorite dish is already in the kitchen.</p></div></div><div className="auth-panel"><form className="auth-form" onSubmit={submit}><Link to="/" className="brand"><span>T</span>Table & Thyme</Link><div><h1>{t(isLogin ? 'auth.loginTitle' : 'auth.registerTitle')}</h1><p>{isLogin ? t('auth.noAccount') : t('auth.hasAccount')} <Link to={isLogin ? '/register' : '/login'}>{t(isLogin ? 'auth.registerLink' : 'auth.loginLink')}</Link></p></div>{error && <div className="notice error">{error}</div>}{!isLogin && <Field label={t('auth.name')} type="text" value={form.name} onChange={(value) => setForm({ ...form, name: value })} autoComplete="name" />}<Field label={t('auth.email')} type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" /><Field label={t('auth.password')} type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} autoComplete={isLogin ? 'current-password' : 'new-password'} /><button className="button primary wide" disabled={busy}>{busy ? t('common.loading') : t(isLogin ? 'auth.login' : 'auth.register')}</button></form></div></section>;
}

function Field({ label, onChange, ...props }) { return <label className="field"><span>{label}</span><input required onChange={(event) => onChange(event.target.value)} {...props} /></label>; }
