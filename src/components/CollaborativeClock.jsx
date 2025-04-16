import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, Typography, TextField, Button } from '@mui/material';
import { collaborationService } from '../services/collaborationService';

const CollaborativeClock = () => {
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const userId = Math.random().toString(36).substr(2, 9);
    collaborationService.connect(userId);

    collaborationService.onUserJoin((user) => {
      setUsers((prev) => [...prev, user]);
    });

    collaborationService.onUserLeave((user) => {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => {
      collaborationService.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (roomId) {
      collaborationService.joinRoom(roomId);
      setIsJoined(true);
    }
  };

  const handleLeaveRoom = () => {
    collaborationService.leaveRoom();
    setIsJoined(false);
    setUsers([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        className="p-4 bg-black/40 backdrop-blur-lg"
        sx={{
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col gap-4">
          <Typography variant="h6" className="text-white">
            Collaborative Clock
          </Typography>

          {!isJoined ? (
            <div className="flex gap-2">
              <TextField
                fullWidth
                label="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleJoinRoom}
                disabled={!roomId}
              >
                Join
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Typography variant="body1" className="text-white">
                  Room: {roomId}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLeaveRoom}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Leave
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="px-3 py-1 bg-primary/20 rounded-full"
                  >
                    <Typography variant="body2" className="text-white">
                      {user.id}
                    </Typography>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Paper>
    </motion.div>
  );
};

export default CollaborativeClock; 