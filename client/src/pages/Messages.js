import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getInitials } from '../utils/helpers';

const Messages = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.emit('join', user._id);

    return () => newSocket.close();
  }, [user._id]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (activeConversation && 
            (message.sender._id === activeConversation.participants.find(p => p._id !== user._id)?._id ||
             message.recipient._id === activeConversation.participants.find(p => p._id !== user._id)?._id)) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      socket.on('userTyping', ({ senderId }) => {
        if (activeConversation) {
          const otherUser = activeConversation.participants.find(p => p._id !== user._id);
          if (otherUser && senderId === otherUser._id) {
            setIsTyping(true);
          }
        }
      });

      socket.on('userStopTyping', ({ senderId }) => {
        if (activeConversation) {
          const otherUser = activeConversation.participants.find(p => p._id !== user._id);
          if (otherUser && senderId === otherUser._id) {
            setIsTyping(false);
          }
        }
      });
    }
  }, [socket, activeConversation, user._id]);

  useEffect(() => {
    if (id) {
      fetchConversations().then(() => {
        selectConversation(id);
      });
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      const conversation = conversations.find(c => 
        c.participants.some(p => p._id === conversationId)
      );
      
      if (conversation) {
        setActiveConversation(conversation);
        const otherUser = conversation.participants.find(p => p._id !== user._id);
        const res = await axios.get(`http://localhost:5000/api/messages/${conversationId}`);
        setMessages(res.data);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const recipientId = activeConversation?.participants.find(p => p._id !== user._id)?._id;
      if (!recipientId) return;

      const res = await axios.post('http://localhost:5000/api/messages', {
        recipientId,
        text: newMessage
      });

      socket?.emit('sendMessage', {
        recipientId,
        message: res.data
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
      setTyping(false);
      socket?.emit('stopTyping', { recipientId });
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      const recipientId = activeConversation?.participants.find(p => p._id !== user._id)?._id;
      socket?.emit('typing', { recipientId });
    }
  };

  const handleStopTyping = () => {
    if (typing) {
      setTyping(false);
      const recipientId = activeConversation?.participants.find(p => p._id !== user._id)?._id;
      socket?.emit('stopTyping', { recipientId });
    }
  };

  const otherUser = activeConversation?.participants.find(p => p._id !== user._id);

  return (
    <div className="messages-container" style={{ marginTop: '60px' }}>
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
        </div>
        {conversations.map(conv => {
          const participant = conv.participants.find(p => p._id !== user._id);
          return (
            <div
              key={conv._id}
              className={`conversation-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
              onClick={() => selectConversation(participant._id)}
            >
              {participant.profilePicture ? (
                <img src={participant.profilePicture} alt="" />
              ) : (
                <div className="avatar">{getInitials(participant.firstName, participant.lastName)}</div>
              )}
              <div className="conversation-info">
                <h4>{participant.firstName} {participant.lastName}</h4>
                <p>{conv.lastMessage?.text || 'Start a conversation'}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="message-area">
        {activeConversation && otherUser ? (
          <>
            <div className="message-header">
              {otherUser.profilePicture ? (
                <img src={otherUser.profilePicture} alt="" />
              ) : (
                <div className="avatar">{getInitials(otherUser.firstName, otherUser.lastName)}</div>
              )}
              <div>
                <h4>{otherUser.firstName} {otherUser.lastName}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {otherUser.isOnline ? 'Online' : `Last seen ${formatDate(otherUser.lastSeen)}`}
                </span>
              </div>
            </div>

            <div className="messages-list">
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`message ${msg.sender._id === user._id ? 'sent' : ''}`}
                >
                  <img src={msg.sender.profilePicture || 'https://via.placeholder.com/100'} alt="" />
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              {isTyping && <div className="message"><div className="message-content"><p>typing...</p></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
              />
              <button type="submit"><i className="fas fa-paper-plane"></i></button>
            </form>
          </>
        ) : (
          <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <i className="fas fa-comments"></i>
              <h3>Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
