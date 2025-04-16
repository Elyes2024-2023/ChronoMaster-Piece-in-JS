import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Switch, FormControlLabel, Paper } from '@mui/material';
import {
  Brightness4,
  Brightness7,
  VolumeUp,
  VolumeOff,
  AccessTime
} from '@mui/icons-material';

const SettingsPanel = ({ onThemeToggle, voiceEnabled, onVoiceToggle }) => {
  const [showDigital, setShowDigital] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
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
          <div className="flex items-center justify-between">
            <span className="text-white">Theme</span>
            <IconButton onClick={onThemeToggle} color="inherit">
              <Brightness4 className="text-white" />
            </IconButton>
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={voiceEnabled}
                onChange={onVoiceToggle}
                color="primary"
              />
            }
            label={
              <div className="flex items-center gap-2">
                {voiceEnabled ? <VolumeUp className="text-white" /> : <VolumeOff className="text-white" />}
                <span className="text-white">Voice Announcements</span>
              </div>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={showDigital}
                onChange={(e) => setShowDigital(e.target.checked)}
                color="primary"
              />
            }
            label={
              <div className="flex items-center gap-2">
                <AccessTime className="text-white" />
                <span className="text-white">Show Digital Time</span>
              </div>
            }
          />
        </div>
      </Paper>
    </motion.div>
  );
};

export default SettingsPanel; 