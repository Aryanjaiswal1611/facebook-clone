const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/pages', require('./routes/pages'));

app.get('/', (req, res) => {
  res.send('Facebook Clone API is running');
});

const userSockets = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    io.emit('userOnline', userId);
  });

  socket.on('sendMessage', (data) => {
    const { recipientId, message } = data;
    const recipientSocket = userSockets.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('newMessage', message);
    }
    io.to(socket.id).emit('messageSent', message);
  });

  socket.on('typing', (data) => {
    const { recipientId } = data;
    const recipientSocket = userSockets.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('userTyping', { senderId: socket.userId });
    }
  });

  socket.on('stopTyping', (data) => {
    const { recipientId } = data;
    const recipientSocket = userSockets.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('userStopTyping', { senderId: socket.userId });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      io.emit('userOffline', socket.userId);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
