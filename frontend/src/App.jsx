import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Upload from './pages/Upload';
import './styles/minimal.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return <BrowserRouter><ScrollToTop /><div className="application-shell"><Navbar /><main><Routes><Route path="/" element={<Home />} /><Route path="/ingest" element={<Upload />} /><Route path="/workspace" element={<Dashboard />} /><Route path="*" element={<Home />} /></Routes></main><Footer /></div></BrowserRouter>;
}
