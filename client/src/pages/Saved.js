import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../components/Post';

const Saved = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts/saved');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Saved Posts</h1>
      
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-bookmark"></i>
          <h3>No saved posts</h3>
          <p>Save posts to see them here</p>
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
  );
};

export default Saved;
