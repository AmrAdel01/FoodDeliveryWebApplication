import { Link } from 'react-router-dom';
export default function NotFoundPage() { return <section className="page section"><div className="container empty-state"><span className="huge">404</span><h1>That page is not on the menu.</h1><Link className="button primary" to="/">Back home</Link></div></section>; }
