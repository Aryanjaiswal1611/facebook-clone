import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getInitials } from '../utils/helpers';

const Post = ({ post, onDelete, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user._id));

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.post(`http://localhost:5000/api/posts/unlike/${post._id}`);
        post.likes = post.likes.filter(id => id.toString() !== user._id);
      } else {
        await axios.post(`http://localhost:5000/api/posts/like/${post._id}`);
        post.likes.push(user._id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/comment/${post._id}`, {
        text: newComment
      });
      post.comments.push({
        _id: Date.now(),
        userId: { _id: user._id, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture },
        text: newComment,
        createdAt: new Date()
      });
      onUpdate(res.data);
      setNewComment('');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/${post._id}`);
        onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const isOwner = post.userId?._id === user._id;

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-user">
          <Link to={`/profile/${post.userId?._id}`}>
            {post.userId?.profilePicture ? (
              <img src={post.userId.profilePicture} alt="" />
            ) : (
              <div className="avatar">{getInitials(post.userId?.firstName, post.userId?.lastName)}</div>
            )}
          </Link>
          <div className="post-user-info">
            <Link to={`/profile/${post.userId?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h4>{post.userId?.firstName} {post.userId?.lastName}</h4>
            </Link>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {isOwner && (
          <div className="post-menu" onClick={handleDelete}>
            <i className="fas fa-ellipsis-h"></i>
          </div>
        )}
      </div>

      <div className="post-content">
        {post.description && <p>{post.description}</p>}
        {post.image && <img src={post.image} alt="" className="post-image" />}
      </div>

      <div className="post-stats">
        <div className="post-stat">
          <i className="fas fa-thumbs-up like-icon"></i>
          <span>{post.likes?.length || 0} likes</span>
        </div>
        <div className="post-stat" style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
          <span>{post.comments?.length || 0} comments</span>
        </div>
      </div>

      <div className="post-actions">
        <div className={`post-action ${isLiked ? 'active' : ''}`} onClick={handleLike}>
          <i className={`fas fa-thumbs-up ${isLiked ? '' : 'far'}`}></i>
          <span>Like</span>
        </div>
        <div className="post-action" onClick={() => setShowComments(!showComments)}>
          <i className="far fa-comment"></i>
          <span>Comment</span>
        </div>
        <div className="post-action">
          <i className="far fa-share-square"></i>
          <span>Share</span>
        </div>
      </div>

      {showComments && (
        <div className="post-comments">
          {post.comments?.map(comment => (
            <div key={comment._id} className="comment">
              <img src={comment.userId?.profilePicture || 'https://via.placeholder.com/100'} alt="" />
              <div className="comment-content">
                <h5>{comment.userId?.firstName} {comment.userId?.lastName}</h5>
                <p>{comment.text}</p>
                <div className="comment-actions">
                  <span>Like</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}

          <form className="add-comment" onSubmit={handleComment}>
            <img src={user.profilePicture || 'https://via.placeholder.com/100'} alt="" />
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
