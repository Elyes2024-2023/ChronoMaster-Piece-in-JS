import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import ClockFace from './components/ClockFace';
import SettingsPanel from './components/SettingsPanel';
import TimeZoneSelector from './components/TimeZoneSelector';
import Weather from './components/Weather';
import CollaborativeClock from './components/CollaborativeClock';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { voiceService } from './services/voiceService';
import { keyboardService } from './services/keyboardService';
import './styles/App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState('UTC');
  const [city, setCity] = useState('London');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);

      // Announce time every hour if voice is enabled
      if (voiceEnabled && newTime.getMinutes() === 0) {
        voiceService.announceTime(newTime.getHours(), newTime.getMinutes());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [voiceEnabled]);

  useEffect(() => {
    // Register keyboard shortcuts
    keyboardService.register('t', toggleTheme, 'Toggle theme');
    keyboardService.register('v', () => {
      setVoiceEnabled(prev => !prev);
      if (!voiceEnabled) {
        voiceService.enable();
      } else {
        voiceService.disable();
      }
    }, 'Toggle voice announcements');
    keyboardService.register('a', () => {
      voiceService.announceTime(time.getHours(), time.getMinutes());
    }, 'Announce current time');
    keyboardService.register('l', () => {
      // Trigger location detection in Weather component
      document.querySelector('[data-testid="location-button"]')?.click();
    }, 'Use current location');

    return () => {
      keyboardService.unregister('t');
      keyboardService.unregister('v');
      keyboardService.unregister('a');
      keyboardService.unregister('l');
    };
  }, [toggleTheme, voiceEnabled, time]);

  const handleCityChange = (newCity) => {
    setCity(newCity);
    // You might want to update the timezone based on the city as well
    // This would require an additional API call to get the timezone for the city
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">ChronoMaster</h1>
            <p className="text-gray-400">Your Modern Analog Clock</p>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-8">
              <ClockFace time={time} />
              <TimeZoneSelector
                selectedTimeZone={selectedTimeZone}
                onTimeZoneChange={setSelectedTimeZone}
              />
              <SettingsPanel
                onThemeToggle={toggleTheme}
                voiceEnabled={voiceEnabled}
                onVoiceToggle={() => {
                  setVoiceEnabled(prev => !prev);
                  if (!voiceEnabled) {
                    voiceService.enable();
                  } else {
                    voiceService.disable();
                  }
                }}
              />
              <KeyboardShortcuts />
            </div>

            <div className="flex flex-col gap-8">
              <Weather city={city} onCityChange={handleCityChange} />
              <CollaborativeClock />
            </div>
          </main>
        </motion.div>
      </div>
    </ThemeProvider>
  );
}

export default App; 