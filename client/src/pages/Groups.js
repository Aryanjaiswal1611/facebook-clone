import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: false });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        axios.get('http://localhost:5000/api/groups/my'),
        axios.get('http://localhost:5000/api/groups/all')
      ]);
      setMyGroups(myRes.data);
      setAllGroups(allRes.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/groups', newGroup);
      setMyGroups([...myGroups, res.data]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', isPrivate: false });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/join/${groupId}`);
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/leave/${groupId}`);
      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Groups</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Create Group
        </button>
      </div>

      <div className="profile-tabs">
        <div className={`profile-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
          Discover
        </div>
        <div className={`profile-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          Your Groups ({myGroups.length})
        </div>
      </div>

      {activeTab === 'discover' && (
        <div className="groups-grid">
          {allGroups.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-users"></i>
              <h3>No groups yet</h3>
              <p>Be the first to create a group!</p>
            </div>
          ) : (
            allGroups.map(group => (
              <div key={group._id} className="group-card">
                <img src={group.coverPicture || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="group-card-info">
                  <h4>{group.name}</h4>
                  <p>{group.members?.length || 0} members • {group.isPrivate ? 'Private' : 'Public'}</p>
                  {group.members?.includes(user._id) ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link to={`/groups/${group._id}`} style={{ flex: 1 }}>
                        <button style={{ width: '100%', background: '#1877f2', color: 'white' }}>View</button>
                      </Link>
                      <button onClick={() => handleLeaveGroup(group._id)}>Leave</button>
                    </div>
                  ) : (
                    <button onClick={() => handleJoinGroup(group._id)}>
                      {group.isPrivate ? 'Request to Join' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="groups-grid">
          {myGroups.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fas fa-users"></i>
              <h3>No groups yet</h3>
              <p>Join or create a group to get started</p>
            </div>
          ) : (
            myGroups.map(group => (
              <div key={group._id} className="group-card">
                <img src={group.coverPicture || 'https://via.placeholder.com/400x200'} alt="" />
                <div className="group-card-info">
                  <h4>{group.name}</h4>
                  <p>{group.members?.length || 0} members</p>
                  <Link to={`/groups/${group._id}`}>
                    <button style={{ width: '100%', background: '#1877f2', color: 'white' }}>View Group</button>
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
              <h3>Create Group</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="modal-textarea"
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={newGroup.isPrivate}
                      onChange={e => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                    />
                    Private Group
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
