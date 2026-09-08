import { Layers3, Menu, Satellite, Upload } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navigation = [{ path: '/', label: 'Overview', icon: Satellite }, { path: '/ingest', label: 'Ingest imagery', icon: Upload }, { path: '/workspace', label: 'Spatial workspace', icon: Layers3 }];

export default function Navbar() {
  return <header className="site-header"><div className="site-header-inner"><Link to="/" className="wordmark"><span className="wordmark-mark"><Satellite size={18} /></span><span>Disaster assessment</span></Link><nav aria-label="Primary navigation" className="primary-nav">{navigation.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><Icon size={15} />{label}</NavLink>)}</nav><Menu className="menu-icon" size={20} aria-label="Navigation" /></div></header>;
}
