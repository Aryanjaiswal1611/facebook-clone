import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const { user, updateUser } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const friendsRes = await axios.get(`http://localhost:5000/api/users/friends/${user._id}`);
      setFriends(friendsRes.data);

      const requestsRes = await axios.get('http://localhost:5000/api/users/requests/list');
      setRequests(requestsRes.data);

      const searchRes = await axios.get('http://localhost:5000/api/users/search?q=');
      const filtered = searchRes.data.filter(u => 
        u._id.toString() !== user._id.toString() && 
        !friendsRes.data.find(f => f._id.toString() === u._id.toString())
      );
      setSuggestions(filtered.slice(0, 6));
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/accept-request/${userId}`);
      const request = requests.find(r => r._id === userId);
      setRequests(requests.filter(r => r._id !== userId));
      setFriends([...friends, request]);
      const res = await axios.get('http://localhost:5000/api/auth/me');
      updateUser(res.data);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/reject-request/${userId}`);
      setRequests(requests.filter(r => r._id !== userId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/friend-request/${userId}`);
      setSuggestions(suggestions.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Friends</h1>
      
      <div className="profile-tabs">
        <div className={`profile-tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
          All Friends
        </div>
        <div className={`profile-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Friend Requests ({requests.length})
        </div>
        <div className={`profile-tab ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')}>
          Suggestions
        </div>
      </div>

      {activeTab === 'friends' && (
        <div className="friends-grid">
          {friends.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-user-friends"></i>
              <h3>No friends yet</h3>
              <p>Find people you may know</p>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend._id} className="friend-card">
                <Link to={`/profile/${friend._id}`}>
                  <img src={friend.profilePicture || 'https://via.placeholder.com/200'} alt="" />
                </Link>
                <div className="friend-card-info">
                  <h4>{friend.firstName} {friend.lastName}</h4>
                  <p>@{friend.username}</p>
                  <div className="friend-card-actions">
                    <button className="btn-primary-profile" style={{ background: '#1877f2' }}>
                      <i className="fas fa-comment"></i> Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="friends-grid">
          {requests.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-user-clock"></i>
              <h3>No friend requests</h3>
              <p>When you receive requests, they'll appear here</p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request._id} className="friend-card">
                <img src={request.profilePicture || 'https://via.placeholder.com/200'} alt="" />
                <div className="friend-card-info">
                  <h4>{request.firstName} {request.lastName}</h4>
                  <p>@{request.username}</p>
                  <div className="friend-card-actions">
                    <button className="btn-primary-profile" onClick={() => handleAcceptRequest(request._id)}>
                      Confirm
                    </button>
                    <button className="btn-secondary-profile" onClick={() => handleRejectRequest(request._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="friends-grid">
          {suggestions.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-search"></i>
              <h3>No suggestions</h3>
              <p>Check back later for people you may know</p>
            </div>
          ) : (
            suggestions.map(suggestion => (
              <div key={suggestion._id} className="friend-card">
                <img src={suggestion.profilePicture || 'https://via.placeholder.com/200'} alt="" />
                <div className="friend-card-info">
                  <h4>{suggestion.firstName} {suggestion.lastName}</h4>
                  <p>@{suggestion.username}</p>
                  <div className="friend-card-actions">
                    <button className="btn-primary-profile" onClick={() => handleSendRequest(suggestion._id)}>
                      Add Friend
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
