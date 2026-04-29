import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Map, Settings, User } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>ElectionJourney</h2>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-item">
            <Map size={20} />
            <span>Journey</span>
          </Link>
          <Link to="/" className="nav-item">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h3>Welcome, Voter</h3>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
