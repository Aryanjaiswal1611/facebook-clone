import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CreatePost = ({ onPostCreated, groupId, pageId }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/posts', {
        description: content,
        groupId,
        pageId
      });
      onPostCreated(res.data);
      setContent('');
      setShowModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <>
      <div className="create-post">
        <div className="create-post-header">
          <img src={user.profilePicture || 'https://via.placeholder.com/100'} alt="" />
          <input
            type="text"
            placeholder={`What's on your mind, ${user.firstName}?`}
            onClick={() => setShowModal(true)}
            readOnly
          />
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Post</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                  <img
                    src={user.profilePicture || 'https://via.placeholder.com/100'}
                    alt=""
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <strong>{user.firstName} {user.lastName}</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Public</p>
                  </div>
                </div>
                <textarea
                  className="modal-textarea"
                  placeholder={`What's on your mind, ${user.firstName}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                />
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <span style={{ cursor: 'pointer', fontSize: '20px', color: '#42b72a' }}>
                      <i className="fas fa-image"></i>
                    </span>
                    <span style={{ cursor: 'pointer', fontSize: '20px', color: '#f3425f' }}>
                      <i className="fas fa-video"></i>
                    </span>
                    <span style={{ cursor: 'pointer', fontSize: '20px', color: '#ffb700' }}>
                      <i className="fas fa-smile"></i>
                    </span>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 25px' }}>
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
