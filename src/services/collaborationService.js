/**
 * ChronoMaster Piece - Collaboration Service
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

import { io } from 'socket.io-client';
import { config } from '../config/env';

const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 2000;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const ROOM_STATE_KEY = 'chronomaster_room_state';
const ROOM_ID_REGEX = /^[a-zA-Z0-9-_]{3,20}$/;

class CollaborationService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.reconnectionAttempts = 0;
    this.eventHandlers = new Map();
    this.heartbeatInterval = null;
    this.oneTimeListeners = new Map();
    this.restoreState();
  }

  validateRoomId(roomId) {
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('Room ID must be a non-empty string');
    }
    if (!ROOM_ID_REGEX.test(roomId)) {
      throw new Error('Room ID must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores');
    }
    return true;
  }

  restoreState() {
    try {
      const savedState = localStorage.getItem(ROOM_STATE_KEY);
      if (savedState) {
        const { roomId, userId, timestamp } = JSON.parse(savedState);
        // Check if state is not too old (e.g., 24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          this.roomId = roomId;
          this.userId = userId;
        } else {
          localStorage.removeItem(ROOM_STATE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to restore room state:', error);
      localStorage.removeItem(ROOM_STATE_KEY);
    }
  }

  saveState() {
    try {
      if (this.roomId && this.userId) {
        localStorage.setItem(ROOM_STATE_KEY, JSON.stringify({
          roomId: this.roomId,
          userId: this.userId,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem(ROOM_STATE_KEY);
      }
    } catch (error) {
      console.error('Failed to save room state:', error);
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', {
          userId: this.userId,
          roomId: this.roomId,
          timestamp: Date.now()
        });
      }
    }, HEARTBEAT_INTERVAL);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  connect(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
    
    this.userId = userId;
    this.socket = io(config.SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
    });

    this.setupEventListeners();
    this.startHeartbeat();
    this.saveState();
  }

  setupEventListeners() {
    if (!this.socket) return;

    const listeners = {
      connect: () => {
        console.log('Connected to collaboration server');
        this.reconnectionAttempts = 0;
        if (this.roomId) {
          this.joinRoom(this.roomId);
        }
      },
      connect_error: (error) => {
        console.error('Connection error:', error);
        this.handleReconnection();
      },
      disconnect: (reason) => {
        console.log('Disconnected:', reason);
        this.stopHeartbeat();
        if (reason === 'io server disconnect') {
          this.handleReconnection();
        }
      },
      error: (error) => {
        console.error('Socket error:', error);
        this.notifyError(error);
      },
      heartbeat_ack: (data) => {
        if (data.status === 'error') {
          this.handleReconnection();
        }
      }
    };

    // Register all listeners
    Object.entries(listeners).forEach(([event, handler]) => {
      this.socket.on(event, handler);
      this.eventHandlers.set(event, handler);
    });
  }

  cleanupEventListeners() {
    if (!this.socket) return;
    
    // Remove all registered event handlers
    this.eventHandlers.forEach((handler, event) => {
      this.socket.off(event, handler);
    });
    this.eventHandlers.clear();
    
    // Remove all one-time listeners
    this.oneTimeListeners.forEach((handler, event) => {
      this.socket.off(event, handler);
    });
    this.oneTimeListeners.clear();
  }

  handleReconnection() {
    if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      this.notifyError(new Error('Unable to connect to collaboration server'));
      return;
    }

    this.reconnectionAttempts++;
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, RECONNECTION_DELAY);
  }

  async joinRoom(roomId) {
    if (!this.socket) {
      throw new Error('Socket connection not established');
    }

    this.validateRoomId(roomId);

    try {
      await new Promise((resolve, reject) => {
        this.socket.emit('joinRoom', { roomId, userId: this.userId });
        
        const successHandler = () => {
          this.roomId = roomId;
          this.saveState();
          resolve();
        };
        
        const errorHandler = (error) => {
          reject(new Error(error.message));
        };
        
        // Register one-time listeners
        this.socket.once('joinRoomSuccess', successHandler);
        this.socket.once('joinRoomError', errorHandler);
        
        // Store for cleanup
        this.oneTimeListeners.set('joinRoomSuccess', successHandler);
        this.oneTimeListeners.set('joinRoomError', errorHandler);
        
        // Timeout after 5 seconds
        const timeoutId = setTimeout(() => {
          reject(new Error('Join room timeout'));
        }, 5000);
        
        // Clean up timeout if resolved
        this.oneTimeListeners.set('timeout', () => clearTimeout(timeoutId));
      });

      // Start sending heartbeats after successfully joining room
      this.startHeartbeat();
    } catch (error) {
      this.notifyError(error);
      throw error;
    } finally {
      // Clean up one-time listeners
      this.oneTimeListeners.forEach((handler, event) => {
        this.socket.off(event, handler);
      });
      this.oneTimeListeners.clear();
    }
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leaveRoom', { roomId: this.roomId, userId: this.userId });
      this.roomId = null;
      this.stopHeartbeat();
      this.saveState();
    }
  }

  updateTime(time) {
    if (!this.socket || !this.roomId) {
      throw new Error('Not connected to a room');
    }

    this.socket.emit('updateTime', {
      roomId: this.roomId,
      userId: this.userId,
      time
    });
  }

  on(event, callback) {
    if (!this.socket) return;
    
    this.eventHandlers.set(event, callback);
    this.socket.on(event, callback);
  }

  off(event) {
    if (!this.socket) return;
    
    const handler = this.eventHandlers.get(event);
    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.delete(event);
    }
  }

  notifyError(error) {
    const errorHandler = this.eventHandlers.get('error');
    if (errorHandler) {
      errorHandler(error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.stopHeartbeat();
      this.cleanupEventListeners();
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
      this.userId = null;
      this.reconnectionAttempts = 0;
      this.saveState();
    }
  }
}

export const collaborationService = new CollaborationService(); 