import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Pages = () => {
  const { user } = useContext(AuthContext);
  const [myPages, setMyPages] = useState([]);
  const [likedPages, setLikedPages] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ name: '', description: '', category: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const [myRes, likedRes, allRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pages/my'),
        axios.get('http://localhost:5000/api/pages/liked'),
        axios.get('http://localhost:5000/api/pages/all')
      ]);
      setMyPages(myRes.data);
      setLikedPages(likedRes.data);
      setAllPages(allRes.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/pages', newPage);
      setMyPages([...myPages, res.data]);
      setShowCreateModal(false);
      setNewPage({ name: '', description: '', category: '' });
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const handleLikePage = async (pageId) => {
    try {
      await axios.post(`http://localhost:5000/api/pages/like/${pageId}`);
      fetchPages();
    } catch (error) {
      console.error('Error liking page:', error);
    }
  };

  const handleUnlikePage = async (pageId) => {
    try {
      await axios.post(`http://localhost:5000/api/pages/unlike/${pageId}`);
      fetchPages();
    } catch (error) {
      console.error('Error unliking page:', error);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Pages</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Create Page
        </button>
      </div>

      <div className="profile-tabs">
        <div className={`profile-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
          Discover
        </div>
        <div className={`profile-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          Your Pages ({myPages.length})
        </div>
        <div className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => setActiveTab('liked')}>
          Liked Pages ({likedPages.length})
        </div>
      </div>

      {activeTab === 'discover' && (
        <div className="groups-grid">
          {allPages.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-flag"></i>
              <h3>No pages yet</h3>
              <p>Be the first to create a page!</p>
            </div>
          ) : (
            allPages.map(page => (
              <div key={page._id} className="group-card">
                <img src={page.coverPicture || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="group-card-info">
                  <h4>{page.name}</h4>
                  <p>{page.category} • {page.likes?.length || 0} likes</p>
                  {page.likes?.includes(user._id) ? (
                    <button onClick={() => handleUnlikePage(page._id)}>Unlike</button>
                  ) : (
                    <button onClick={() => handleLikePage(page._id)}>Like</button>
                  )}
                  <Link to={`/pages/${page._id}`}>
                    <button style={{ width: '100%', marginTop: '10px', background: '#1877f2', color: 'white' }}>Visit Page</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="groups-grid">
          {myPages.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-flag"></i>
              <h3>No pages yet</h3>
              <p>Create a page to get started</p>
            </div>
          ) : (
            myPages.map(page => (
              <div key={page._id} className="group-card">
                <img src={page.coverPicture || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="group-card-info">
                  <h4>{page.name}</h4>
                  <p>{page.followers?.length || 0} followers</p>
                  <Link to={`/pages/${page._id}`}>
                    <button style={{ width: '100%', background: '#1877f2', color: 'white' }}>Manage Page</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="groups-grid">
          {likedPages.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-heart"></i>
              <h3>No liked pages</h3>
              <p>Pages you like will appear here</p>
            </div>
          ) : (
            likedPages.map(page => (
              <div key={page._id} className="group-card">
                <img src={page.coverPicture || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="group-card-info">
                  <h4>{page.name}</h4>
                  <p>{page.category} • {page.likes?.length || 0} likes</p>
                  <Link to={`/pages/${page._id}`}>
                    <button style={{ width: '100%', background: '#1877f2', color: 'white' }}>Visit Page</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Page</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePage}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Page Name</label>
                  <input
                    type="text"
                    value={newPage.name}
                    onChange={e => setNewPage({ ...newPage, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={newPage.category}
                    onChange={e => setNewPage({ ...newPage, category: e.target.value })}
                    placeholder="e.g., Business, Entertainment"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="modal-textarea"
                    value={newPage.description}
                    onChange={e => setNewPage({ ...newPage, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Create Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
