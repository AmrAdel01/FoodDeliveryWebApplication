import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return <><Navbar /><main><Outlet /></main><footer><div className="container footer-inner"><span className="brand small"><span>T</span>Table & Thyme</span><p>Freshly made. Thoughtfully delivered.</p><p>© {new Date().getFullYear()}</p></div></footer></>;
}
