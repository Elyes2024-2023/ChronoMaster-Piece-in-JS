/**
 * ChronoMaster Piece - Weather Service
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

import config from '../config/env';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = config.retryAttempts) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await delay(config.retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw new Error(`Failed after ${config.retryAttempts} attempts: ${error.message}`);
  }
}

export const getWeather = async (lat, lon) => {
  const url = `${config.weatherApiUrl}/weather?lat=${lat}&lon=${lon}&appid=${config.weatherApiKey}&units=metric`;
  
  try {
    const data = await fetchWithRetry(url);
    return transformWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Unable to fetch weather data. Please try again later.');
  }
};

export const getWeatherByCity = async (city) => {
  const url = `${config.weatherApiUrl}/weather?q=${encodeURIComponent(city)}&appid=${config.weatherApiKey}&units=metric`;
  
  try {
    const data = await fetchWithRetry(url);
    return transformWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw new Error(`Unable to fetch weather data for ${city}. Please check the city name and try again.`);
  }
};

export const getForecast = async (lat, lon) => {
  const url = `${config.weatherApiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${config.weatherApiKey}&units=metric`;
  
  try {
    const data = await fetchWithRetry(url);
    return transformForecastData(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw new Error('Unable to fetch forecast data. Please try again later.');
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      }
    );
  });
};

export const getCityByCoordinates = async (lat, lon) => {
  const url = `${config.weatherApiUrl}/weather?lat=${lat}&lon=${lon}&appid=${config.weatherApiKey}`;
  
  try {
    const data = await fetchWithRetry(url);
    return data.name;
  } catch (error) {
    console.error('Error fetching city:', error);
    throw new Error('Unable to determine city name from coordinates.');
  }
};

const transformWeatherData = (data) => ({
  temperature: Math.round(data.main.temp),
  feelsLike: Math.round(data.main.feels_like),
  humidity: data.main.humidity,
  windSpeed: data.wind.speed,
  description: data.weather[0].description,
  icon: data.weather[0].icon,
  sunrise: new Date(data.sys.sunrise * 1000),
  sunset: new Date(data.sys.sunset * 1000),
  coordinates: {
    lat: data.coord.lat,
    lon: data.coord.lon
  }
});

const transformForecastData = (data) => {
  const dailyForecasts = new Map();

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();

    if (!dailyForecasts.has(dateKey)) {
      dailyForecasts.set(dateKey, {
        date,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        icon: item.weather[0].icon,
        description: item.weather[0].description
      });
    } else {
      const forecast = dailyForecasts.get(dateKey);
      forecast.tempMin = Math.min(forecast.tempMin, item.main.temp_min);
      forecast.tempMax = Math.max(forecast.tempMax, item.main.temp_max);
    }
  });

  return Array.from(dailyForecasts.values());
}; 