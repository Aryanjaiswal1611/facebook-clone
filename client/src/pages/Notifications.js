import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDate, getInitials } from '../utils/helpers';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.seen) {
        await axios.put(`http://localhost:5000/api/notifications/read/${notification._id}`);
      }

      if (notification.type === 'friend_request') {
        window.location.href = '/friends';
      } else if (notification.postId) {
        window.location.href = '/';
      } else if (notification.sender?._id) {
        window.location.href = `/profile/${notification.sender._id}`;
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return 'fa-thumbs-up';
      case 'comment': return 'fa-comment';
      case 'friend_request': return 'fa-user-plus';
      case 'friend_accept': return 'fa-user-check';
      case 'message': return 'fa-envelope';
      case 'post': return 'fa-newspaper';
      default: return 'fa-bell';
    }
  };

  const getNotificationText = (notification) => {
    const name = notification.sender ? `${notification.sender.firstName} ${notification.sender.lastName}` : 'Someone';
    
    switch (notification.type) {
      case 'like': return `${name} liked your post`;
      case 'comment': return `${name} commented on your post`;
      case 'friend_request': return `${name} sent you a friend request`;
      case 'friend_accept': return `${name} accepted your friend request`;
      case 'message': return `${name} sent you a message`;
      case 'post': return `${name} posted something`;
      default: return notification.text || 'New notification';
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Notifications</h1>
      
      <div className="notifications-list">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell"></i>
            <h3>No notifications</h3>
            <p>When you get notifications, they'll show up here</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.seen ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div style={{ position: 'relative' }}>
                {notification.sender?.profilePicture ? (
                  <img src={notification.sender.profilePicture} alt="" />
                ) : (
                  <div className="avatar" style={{ width: '60px', height: '60px' }}>
                    {getInitials(notification.sender?.firstName, notification.sender?.lastName)}
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '25px',
                  height: '25px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                </div>
              </div>
              <div className="notification-content">
                <p><strong>{notification.sender?.firstName} {notification.sender?.lastName}</strong> {getNotificationText(notification).replace(notification.sender?.firstName + ' ', '').replace(notification.sender?.lastName + ' ', '')}</p>
                <span>{formatDate(notification.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
