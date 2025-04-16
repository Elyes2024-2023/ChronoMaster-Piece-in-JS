import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, Typography, CircularProgress, IconButton, Tabs, Tab, Box } from '@mui/material';
import { MyLocation, LocationCity, WbSunny, Thermostat } from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getWeather,
  getWeatherByCity,
  getForecast,
  getCurrentLocation,
  getCityByCoordinates
} from '../services/weatherService';

const Weather = ({ city, onCityChange }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [usingLocation, setUsingLocation] = useState(false);

  const fetchWeatherData = async (lat, lon, cityName) => {
    try {
      setLoading(true);
      setError(null);

      const weatherData = lat && lon
        ? await getWeather(lat, lon)
        : await getWeatherByCity(cityName);

      if (!weatherData) {
        throw new Error('Failed to fetch weather data');
      }

      setWeather(weatherData);

      // Fetch forecast using coordinates
      const forecastData = await getForecast(
        lat || weatherData.coordinates.lat,
        lon || weatherData.coordinates.lon
      );
      setForecast(forecastData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usingLocation) {
      fetchWeatherData(null, null, city);
    }
  }, [city, usingLocation]);

  const handleLocationClick = async () => {
    try {
      const position = await getCurrentLocation();
      const cityName = await getCityByCoordinates(position.lat, position.lon);
      onCityChange(cityName);
      setUsingLocation(true);
      fetchWeatherData(position.lat, position.lon);
    } catch (err) {
      setError('Failed to get location. Please enable location services.');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center p-4"
      >
        <CircularProgress />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-red-500/20 rounded-lg"
      >
        <Typography color="error">{error}</Typography>
      </motion.div>
    );
  }

  if (!weather) return null;

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
          {/* Header with location controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LocationCity className="text-white" />
              <Typography variant="h6" className="text-white">
                {city}
              </Typography>
            </div>
            <IconButton onClick={handleLocationClick} color="inherit">
              <MyLocation className="text-white" />
            </IconButton>
          </div>

          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-20 h-20"
              />
              <div>
                <Typography variant="h3" className="text-white">
                  {weather.temperature}°C
                </Typography>
                <Typography variant="body1" className="text-gray-300 capitalize">
                  {weather.description}
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <Typography variant="body2" className="text-gray-400">
                Feels like: {weather.feelsLike}°C
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Humidity: {weather.humidity}%
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Wind: {weather.windSpeed} m/s
              </Typography>
            </div>
          </div>

          {/* Sun times */}
          <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <WbSunny className="text-yellow-500" />
              <div>
                <Typography variant="caption" className="text-gray-400">
                  Sunrise
                </Typography>
                <Typography variant="body2" className="text-white">
                  {format(weather.sunrise, 'HH:mm')}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WbSunny className="text-orange-500" />
              <div>
                <Typography variant="caption" className="text-gray-400">
                  Sunset
                </Typography>
                <Typography variant="body2" className="text-white">
                  {format(weather.sunset, 'HH:mm')}
                </Typography>
              </div>
            </div>
          </div>

          {/* Forecast */}
          {forecast && (
            <div className="mt-4">
              <Typography variant="h6" className="text-white mb-2">
                5-Day Forecast
              </Typography>
              <div className="flex overflow-x-auto gap-4 pb-2">
                {forecast.slice(0, 5).map((day) => (
                  <Paper
                    key={day.date.toISOString()}
                    elevation={2}
                    className="p-3 bg-white/5 flex-shrink-0"
                    sx={{ borderRadius: 2, minWidth: '120px' }}
                  >
                    <Typography variant="caption" className="text-gray-400">
                      {format(day.date, 'EEE, MMM d')}
                    </Typography>
                    <div className="flex items-center justify-between">
                      <img
                        src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                        alt={day.description}
                        className="w-10 h-10"
                      />
                      <div className="text-right">
                        <Typography variant="body2" className="text-white">
                          {Math.round(day.tempMax)}°
                        </Typography>
                        <Typography variant="caption" className="text-gray-400">
                          {Math.round(day.tempMin)}°
                        </Typography>
                      </div>
                    </div>
                  </Paper>
                ))}
              </div>
            </div>
          )}
        </div>
      </Paper>
    </motion.div>
  );
};

export default Weather; 