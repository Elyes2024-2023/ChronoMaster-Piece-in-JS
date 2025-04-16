/**
 * ChronoMaster Piece - Rate Limiter Middleware
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
  }

  cleanupOldRequests() {
    const now = Date.now();
    for (const [clientId, client] of this.clients.entries()) {
      client.requests = client.requests.filter(time => now - time < this.windowMs);
      if (client.requests.length === 0) {
        this.clients.delete(clientId);
      }
    }
  }

  isRateLimited(clientId) {
    this.cleanupOldRequests();

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { requests: [] });
    }

    const client = this.clients.get(clientId);
    const now = Date.now();

    if (client.requests.length >= this.maxRequests) {
      return true;
    }

    client.requests.push(now);
    return false;
  }
}

// Create a rate limiter instance
const rateLimiter = new RateLimiter();

// Middleware function
const rateLimiterMiddleware = (socket, next) => {
  const clientId = socket.handshake.address;

  if (rateLimiter.isRateLimited(clientId)) {
    const error = new Error('Too many requests. Please try again later.');
    error.statusCode = 429;
    return next(error);
  }

  next();
};

module.exports = rateLimiterMiddleware; 