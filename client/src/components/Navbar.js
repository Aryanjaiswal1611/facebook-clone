import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length > 0) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error('Error searching:', error);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications/unread');
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">facebook</Link>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search Facebook"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              {searchResults.map(result => (
                <Link
                  key={result._id}
                  to={`/profile/${result._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <img
                    src={result.profilePicture || 'https://via.placeholder.com/100'}
                    alt=""
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>{result.firstName} {result.lastName}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-center">
        <Link to="/" className="nav-icon" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to="/friends" className="nav-icon" title="Friends">
          <i className="fas fa-user-friends"></i>
        </Link>
        <Link to="/groups" className="nav-icon" title="Groups">
          <i className="fas fa-users"></i>
        </Link>
        <Link to="/pages" className="nav-icon" title="Pages">
          <i className="fas fa-flag"></i>
        </Link>
        <Link to="/notifications" className="nav-icon" title="Notifications">
          <i className="fas fa-bell"></i>
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/search" className="nav-icon-btn" title="Search">
          <i className="fas fa-search"></i>
        </Link>
        <Link to="/saved" className="nav-icon-btn" title="Saved">
          <i className="fas fa-bookmark"></i>
        </Link>
        <Link to="/messages" className="nav-icon-btn" title="Messages">
          <i className="fas fa-comment-dots"></i>
        </Link>
        <Link to="/notifications" className="nav-icon-btn" title="Notifications">
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>
        <div className="nav-icon-btn" onClick={handleLogout} title="Logout">
          <i className="fas fa-sign-out-alt"></i>
        </div>
        <Link to={`/profile/${user._id}`}>
          <img
            src={user.profilePicture || 'https://via.placeholder.com/100'}
            alt=""
            className="nav-profile"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
