/**
 * ChronoMaster Piece - Server
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimiterMiddleware = require('./middleware/rateLimiter');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active rooms and users
const rooms = new Map();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Apply rate limiter to socket connections
io.use(rateLimiterMiddleware);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', ({ userId }) => {
    try {
      socket.userId = userId;
      console.log(`User ${userId} joined`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join' });
    }
  });

  // Handle room joining
  socket.on('joinRoom', ({ roomId }) => {
    try {
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      // Add user to room
      rooms.get(roomId).add(socket.userId);
      
      // Notify others in the room
      socket.to(roomId).emit('userJoin', { id: socket.userId });
      
      // Send current users in the room to the joining user
      const users = Array.from(rooms.get(roomId));
      socket.emit('roomUsers', { users });
      
      console.log(`User ${socket.userId} joined room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle time updates with rate limiting
  let lastUpdateTime = 0;
  const MIN_UPDATE_INTERVAL = 100; // 100ms minimum between updates

  socket.on('updateTime', ({ roomId, time }) => {
    try {
      const now = Date.now();
      if (now - lastUpdateTime >= MIN_UPDATE_INTERVAL) {
        socket.to(roomId).emit('timeUpdate', { time, userId: socket.userId });
        lastUpdateTime = now;
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to update time' });
    }
  });

  // Handle room leaving
  socket.on('leaveRoom', ({ roomId }) => {
    try {
      socket.leave(roomId);
      
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.userId);
        
        // Remove room if empty
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
      
      socket.to(roomId).emit('userLeave', { id: socket.userId });
      console.log(`User ${socket.userId} left room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to leave room' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      console.log('User disconnected:', socket.id);
      
      // Remove user from all rooms
      rooms.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          io.to(roomId).emit('userLeave', { id: socket.userId });
          
          // Remove room if empty
          if (users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', { message: 'An unexpected error occurred' });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 