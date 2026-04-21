import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Post from '../components/Post';

const GroupPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, postsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/groups/${id}`),
        axios.get(`http://localhost:5000/api/groups/${id}/posts`)
      ]);
      setGroup(groupRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await axios.post(`http://localhost:5000/api/groups/join/${id}`);
      fetchGroupData();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`http://localhost:5000/api/groups/leave/${id}`);
      fetchGroupData();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/posts', {
        description: newPost,
        groupId: id
      });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const isMember = group?.members?.some(m => m._id === user._id);
  const isAdmin = group?.admin?._id === user._id;

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!group) {
    return <div className="container"><p>Group not found</p></div>;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="cover-photo">
          <img 
            src={group.coverPicture || 'https://via.placeholder.com/1200x400'} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="profile-info">
          <h1>{group.name}</h1>
          <p>{group.isPrivate ? 'Private Group' : 'Public Group'} • {group.members?.length || 0} members</p>
          
          <div className="profile-actions">
            {isMember ? (
              <button className="btn-secondary-profile" onClick={handleLeaveGroup}>
                <i className="fas fa-sign-out-alt"></i> Leave Group
              </button>
            ) : (
              <button className="btn-primary-profile" onClick={handleJoinGroup}>
                <i className="fas fa-plus"></i> Join Group
              </button>
            )}
          </div>
        </div>
        {group.description && (
          <p style={{ padding: '0 30px 20px', color: 'var(--text-secondary)' }}>{group.description}</p>
        )}
      </div>

      {isMember && (
        <div className="create-post" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreatePost}>
            <div className="create-post-header">
              <img src={user.profilePicture || 'https://via.placeholder.com/100'} alt="" />
              <input
                type="text"
                placeholder={`Share something with ${group.name}...`}
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
            </div>
            <div className="create-post-options">
              <button type="submit" className="btn btn-primary">Post</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {posts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-newspaper"></i>
            <h3>No posts yet</h3>
            {isMember && <p>Be the first to post in this group!</p>}
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

export default GroupPage;
