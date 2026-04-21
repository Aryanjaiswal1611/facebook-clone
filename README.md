# Facebook Clone

A full-featured Facebook clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Core Features
- **User Authentication**: Register, login, logout with JWT tokens
- **User Profiles**: View and edit profile, cover photo, bio, and personal info
- **News Feed**: See posts from friends, create posts with text/images
- **Likes & Comments**: Like posts, add comments, view engagement
- **Real-time Messaging**: Chat with friends using Socket.io
- **Notifications**: Get notified for likes, comments, friend requests, messages

### Social Features
- **Friends**: Send/accept/reject friend requests, unfriend
- **Follow/Unfollow**: Follow users without being friends
- **Groups**: Create/join groups, post in groups, manage members
- **Pages**: Create pages, like/follow pages, post as page

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time features
- bcryptjs for password hashing

### Frontend
- React.js (v18)
- React Router (v6)
- Context API for state management
- Socket.io Client
- timeago.js for timestamps
- Font Awesome icons

## Quick Start

### 1. Prerequisites
Make sure you have:
- Node.js (v14 or higher)
- MongoDB (running locally or use MongoDB Atlas)
- npm or yarn

### 2. Clone the Project
```bash
cd "facebook clone"
```

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 4. Configure Environment

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/facebook-clone
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 5. Start MongoDB
Make sure MongoDB is running on your system or update the `MONGO_URI` to point to MongoDB Atlas.

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will open at http://localhost:3000

## Project Structure

```
facebook-clone/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── userController.js   # User management
│   │   ├── postController.js   # Posts & feed
│   │   ├── messageController.js # Messaging
│   │   ├── notificationController.js
│   │   ├── groupController.js
│   │   └── pageController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Group.js
│   │   └── Page.js
│   ├── routes/
│   │   └── (API route files)
│   ├── .env
│   ├── package.json
│   └── index.js               # Server entry point
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── CreatePost.js
│   │   │   └── Post.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   ├── Friends.js
│   │   │   ├── Messages.js
│   │   │   ├── Groups.js
│   │   │   ├── GroupPage.js
│   │   │   ├── Pages.js
│   │   │   ├── PageView.js
│   │   │   ├── Notifications.js
│   │   │   ├── Saved.js
│   │   │   ├── Search.js
│   │   │   └── NotFound.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json              # Root package.json
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/search?q=` | Search users |
| PUT | `/api/users` | Update current user |
| POST | `/api/users/friend-request/:id` | Send friend request |
| PUT | `/api/users/accept-request/:id` | Accept request |
| DELETE | `/api/users/unfriend/:id` | Unfriend user |
| POST | `/api/users/follow/:id` | Follow user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts/timeline` | Get timeline |
| GET | `/api/posts/user/:id` | Get user posts |
| GET | `/api/posts/saved` | Get saved posts |
| POST | `/api/posts/like/:id` | Like post |
| POST | `/api/posts/unlike/:id` | Unlike post |
| POST | `/api/posts/comment/:id` | Comment on post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/save/:id` | Save post |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/conversations` | Get conversations |
| GET | `/api/messages/:otherUserId` | Get messages |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups/my` | Get my groups |
| GET | `/api/groups/all` | Discover groups |
| POST | `/api/groups/join/:id` | Join group |
| POST | `/api/groups/leave/:id` | Leave group |

### Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pages` | Create page |
| GET | `/api/pages/all` | Discover pages |
| POST | `/api/pages/like/:id` | Like page |
| POST | `/api/pages/follow/:id` | Follow page |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |

## Usage Tips

1. **Register**: Create an account to get started
2. **Complete Profile**: Add profile picture and bio
3. **Add Friends**: Search for users and send friend requests
4. **Create Posts**: Share thoughts, photos with friends
5. **Join Groups**: Find communities with similar interests
6. **Like Pages**: Follow your favorite brands/pages
7. **Chat**: Real-time messaging with friends

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running: `mongod`
- Check the connection string in `.env`

### Port Already in Use
- If port 5000 is in use, change it in `.env`
- Update the client API base URL if backend port changes

### Socket.io Connection Issues
- Make sure backend is running before frontend
- Check CORS configuration in server/index.js

## Future Enhancements

- Image upload (Cloudinary/S3 integration)
- Video uploads and streaming
- Stories feature
- Live streaming
- Marketplace
- Events
- Dark mode

## License

MIT License
