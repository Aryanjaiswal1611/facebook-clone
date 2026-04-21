import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts/timeline');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  return (
    <div className="home-content">
      <div className="sidebar-left">
        <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-item">
            <img src={user?.profilePicture || 'https://via.placeholder.com/100'} alt="" />
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
        </Link>
        <Link to="/friends" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-item">
            <i className="fas fa-user-friends" style={{ fontSize: '24px', color: '#1877f2' }}></i>
            <span>Friends</span>
          </div>
        </Link>
        <Link to="/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-item">
            <i className="fas fa-users" style={{ fontSize: '24px', color: '#1877f2' }}></i>
            <span>Groups</span>
          </div>
        </Link>
        <Link to="/pages" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-item">
            <i className="fas fa-flag" style={{ fontSize: '24px', color: '#1877f2' }}></i>
            <span>Pages</span>
          </div>
        </Link>
        <Link to="/messages" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-item">
            <i className="fas fa-comment-dots" style={{ fontSize: '24px', color: '#1877f2' }}></i>
            <span>Messages</span>
          </div>
        </Link>
      </div>

      <div className="feed">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-newspaper"></i>
            <h3>No posts yet</h3>
            <p>Create your first post to get started!</p>
          </div>
        ) : (
          posts.map(post => (
            <Post
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          ))
        )}
      </div>

      <div className="sidebar-right">
        <div className="empty-state">
          <i className="fas fa-bullhorn"></i>
          <h3>Sponsored</h3>
          <p>Your ads could appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
