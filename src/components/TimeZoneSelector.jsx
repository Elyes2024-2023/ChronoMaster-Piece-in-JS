import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const TimeZoneSelector = ({ selectedTimeZone, onTimeZoneChange }) => {
  const [timeZones, setTimeZones] = useState([]);

  useEffect(() => {
    // Get all available time zones
    const zones = Intl.supportedValuesOf('timeZone');
    setTimeZones(zones.sort());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-64"
    >
      <FormControl fullWidth>
        <InputLabel id="timezone-select-label">Time Zone</InputLabel>
        <Select
          labelId="timezone-select-label"
          value={selectedTimeZone}
          label="Time Zone"
          onChange={(e) => onTimeZoneChange(e.target.value)}
          sx={{
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          {timeZones.map((zone) => (
            <MenuItem key={zone} value={zone}>
              {zone}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </motion.div>
  );
};

export default TimeZoneSelector; 