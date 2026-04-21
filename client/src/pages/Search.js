import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getInitials } from '../utils/helpers';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/users/search?q=${query}`);
        setResults(res.data);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Search</h1>
      
      <div className="form-group" style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search for people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '25px',
            border: '1px solid var(--border)',
            fontSize: '16px'
          }}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : results.length === 0 && query.length >= 2 ? (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <h3>No results found</h3>
          <p>Try searching with different keywords</p>
        </div>
      ) : results.length > 0 ? (
        <div className="friends-grid">
          {results.map(user => (
            <div key={user._id} className="friend-card">
              <Link to={`/profile/${user._id}`}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="" />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--secondary)'
                  }}>
                    <div className="avatar large">{getInitials(user.firstName, user.lastName)}</div>
                  </div>
                )}
              </Link>
              <div className="friend-card-info">
                <h4>{user.firstName} {user.lastName}</h4>
                <p>@{user.username}</p>
                <div className="friend-card-actions">
                  <Link to={`/profile/${user._id}`}>
                    <button className="btn-primary-profile" style={{ background: '#1877f2' }}>
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <h3>Find people</h3>
          <p>Search for people by name or username</p>
        </div>
      )}
    </div>
  );
};

export default Search;
