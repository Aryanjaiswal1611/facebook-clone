import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getInitials } from '../utils/helpers';
import Post from '../components/Post';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = id || currentUser._id;
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setProfileUser(res.data);
        setIsOwnProfile(res.data._id === currentUser._id);

        const postsRes = await axios.get(`http://localhost:5000/api/posts/user/${userId}`);
        setPosts(postsRes.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser._id]);

  const handleFollow = async () => {
    try {
      if (profileUser.followers?.includes(currentUser._id)) {
        await axios.post(`http://localhost:5000/api/users/unfollow/${profileUser._id}`);
      } else {
        await axios.post(`http://localhost:5000/api/users/follow/${profileUser._id}`);
      }
      const res = await axios.get(`http://localhost:5000/api/users/${profileUser._id}`);
      setProfileUser(res.data);
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  const handleSendRequest = async () => {
    try {
      await axios.post(`http://localhost:5000/api/users/friend-request/${profileUser._id}`);
      const res = await axios.get(`http://localhost:5000/api/users/${profileUser._id}`);
      setProfileUser(res.data);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/accept-request/${profileUser._id}`);
      const res = await axios.get(`http://localhost:5000/api/users/${profileUser._id}`);
      setProfileUser(res.data);
      const userRes = await axios.get('http://localhost:5000/api/auth/me');
      updateUser(userRes.data);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleUnfriend = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/unfriend/${profileUser._id}`);
      const res = await axios.get(`http://localhost:5000/api/users/${profileUser._id}`);
      setProfileUser(res.data);
    } catch (error) {
      console.error('Error unfriending:', error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!profileUser) {
    return <div className="container"><p>User not found</p></div>;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="cover-photo">
          <div className="profile-photo">
            {profileUser.profilePicture ? (
              <img src={profileUser.profilePicture} alt="" />
            ) : (
              <div className="avatar xl">{getInitials(profileUser.firstName, profileUser.lastName)}</div>
            )}
          </div>
        </div>
        <div className="profile-info">
          <h1>{profileUser.firstName} {profileUser.lastName}</h1>
          <p>@{profileUser.username}</p>
          {profileUser.bio && <p>{profileUser.bio}</p>}
          
          <div className="profile-stats" style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
            <div>
              <strong>{posts.length || 0}</strong> Posts
            </div>
            <div>
              <strong>{profileUser.friends?.length || 0}</strong> Friends
            </div>
            <div>
              <strong>{profileUser.followers?.length || 0}</strong> Followers
            </div>
          </div>

          <div className="profile-actions">
            {!isOwnProfile && (
              <>
                {profileUser.friends?.includes(currentUser._id) ? (
                  <button className="btn-primary-profile" onClick={handleUnfriend}>
                    <i className="fas fa-user-minus"></i> Unfriend
                  </button>
                ) : profileUser.sentRequests?.includes(currentUser._id) ? (
                  <button className="btn-secondary-profile">
                    <i className="fas fa-clock"></i> Request Sent
                  </button>
                ) : profileUser.friendRequests?.includes(currentUser._id) ? (
                  <button className="btn-primary-profile" onClick={handleAcceptRequest}>
                    <i className="fas fa-user-plus"></i> Accept Request
                  </button>
                ) : (
                  <button className="btn-primary-profile" onClick={handleSendRequest}>
                    <i className="fas fa-user-plus"></i> Add Friend
                  </button>
                )}
                <button className="btn-secondary-profile" onClick={handleFollow}>
                  <i className="fas fa-user-plus"></i>
                  {profileUser.followers?.includes(currentUser._id) ? ' Unfollow' : ' Follow'}
                </button>
              </>
            )}
            {isOwnProfile && (
              <button className="btn-edit">
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts
          </div>
          <div className={`profile-tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
            Friends
          </div>
          <div className={`profile-tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            Photos
          </div>
        </div>
      </div>

      {activeTab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-newspaper"></i>
              <h3>No posts yet</h3>
              {isOwnProfile && <p>Share your first post!</p>}
            </div>
          ) : (
            posts.map(post => (
              <Post key={post._id} post={post} />
            ))
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="friends-grid">
          {profileUser.friends?.map(friend => (
            <div key={friend._id} className="friend-card">
              <img src={friend.profilePicture || 'https://via.placeholder.com/200'} alt="" />
              <div className="friend-card-info">
                <h4>{friend.firstName} {friend.lastName}</h4>
                <p>@{friend.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="empty-state">
          <i className="fas fa-images"></i>
          <h3>No photos yet</h3>
        </div>
      )}
    </div>
  );
};

export default Profile;
