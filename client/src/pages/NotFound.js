import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: '100px' }}>
        <h1 style={{ fontSize: '72px', color: 'var(--primary)' }}>404</h1>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '60px', color: 'var(--danger)' }}></i>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/">
          <button className="btn btn-primary" style={{ marginTop: '20px', width: 'auto' }}>
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
