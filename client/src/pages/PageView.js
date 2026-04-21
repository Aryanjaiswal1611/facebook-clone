import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Post from '../components/Post';

const PageView = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchPageData();
  }, [id]);

  const fetchPageData = async () => {
    try {
      const [pageRes, postsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/pages/${id}`),
        axios.get(`http://localhost:5000/api/pages/${id}/posts`)
      ]);
      setPage(pageRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePage = async () => {
    try {
      if (page.likes?.includes(user._id)) {
        await axios.post(`http://localhost:5000/api/pages/unlike/${id}`);
      } else {
        await axios.post(`http://localhost:5000/api/pages/like/${id}`);
      }
      fetchPageData();
    } catch (error) {
      console.error('Error liking page:', error);
    }
  };

  const handleFollowPage = async () => {
    try {
      if (page.followers?.includes(user._id)) {
        await axios.post(`http://localhost:5000/api/pages/unfollow/${id}`);
      } else {
        await axios.post(`http://localhost:5000/api/pages/follow/${id}`);
      }
      fetchPageData();
    } catch (error) {
      console.error('Error following page:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/posts', {
        description: newPost,
        pageId: id
      });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const isAdmin = page?.admin?._id === user._id;
  const hasLiked = page?.likes?.includes(user._id);
  const hasFollowed = page?.followers?.includes(user._id);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!page) {
    return <div className="container"><p>Page not found</p></div>;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="cover-photo">
          <img 
            src={page.coverPicture || 'https://via.placeholder.com/1200x400'} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="profile-info" style={{ paddingTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'white', border: '4px solid white' }}>
              <img 
                src={page.profilePicture || 'https://via.placeholder.com/100'} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h1>{page.name}</h1>
              <p>{page.category} • {page.followers?.length || 0} followers • {page.likes?.length || 0} likes</p>
            </div>
          </div>
          
          <div className="profile-actions">
            {isAdmin ? (
              <button className="btn-primary-profile">
                <i className="fas fa-edit"></i> Edit Page
              </button>
            ) : (
              <>
                <button 
                  className={`btn-primary-profile ${hasLiked ? '' : ''}`}
                  onClick={handleLikePage}
                  style={{ background: hasLiked ? '#65676b' : '#1877f2' }}
                >
                  <i className={`fas fa-thumbs-up ${hasLiked ? '' : '-o'}`}></i> {hasLiked ? 'Liked' : 'Like'}
                </button>
                <button 
                  className="btn-secondary-profile"
                  onClick={handleFollowPage}
                  style={{ background: hasFollowed ? '#65676b' : '#42b72a' }}
                >
                  <i className="fas fa-user-plus"></i> {hasFollowed ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>
        {page.description && (
          <p style={{ padding: '0 30px 20px', color: 'var(--text-secondary)' }}>{page.description}</p>
        )}
      </div>

      {isAdmin && (
        <div className="create-post" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreatePost}>
            <div className="create-post-header">
              <img src={user.profilePicture || 'https://via.placeholder.com/100'} alt="" />
              <input
                type="text"
                placeholder={`Post as ${page.name}...`}
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
            </div>
            <div className="create-post-options">
              <button type="submit" className="btn btn-primary">Publish</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {posts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-newspaper"></i>
            <h3>No posts yet</h3>
            {isAdmin && <p>Create your first post!</p>}
          </div>
        ) : (
          posts.map(post => (
            <Post key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default PageView;
