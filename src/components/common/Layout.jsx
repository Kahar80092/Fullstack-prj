import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Disclaimer from './Disclaimer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Disclaimer />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
