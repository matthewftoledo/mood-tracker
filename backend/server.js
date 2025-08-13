const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'c7b21779cc01494514d8c65842862d7f';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Data file path
const MOODS_FILE = path.join(__dirname, 'data', 'moods.json');

// Initialize moods file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(MOODS_FILE);
  } catch (error) {
    await fs.writeFile(MOODS_FILE, JSON.stringify([], null, 2));
  }
}

// Helper function to read moods
async function readMoods() {
  try {
    const data = await fs.readFile(MOODS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write moods
async function writeMoods(moods) {
  await fs.writeFile(MOODS_FILE, JSON.stringify(moods, null, 2));
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Routes

// Get weather data
app.get('/api/weather/:city', async (req, res) => {
  const { city } = req.params;
  
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    const weatherData = {
      temp: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      city: response.data.name,
      icon: response.data.weather[0].icon
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    
    // Return mock data if API fails
    const mockWeather = {
      temp: 22,
      description: 'partly cloudy',
      city: city,
      icon: '02d'
    };
    
    res.json(mockWeather);
  }
});

// Get all moods
app.get('/api/moods', async (req, res) => {
  try {
    const moods = await readMoods();
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read moods' });
  }
});

// Create new mood entry
app.post('/api/moods', async (req, res) => {
  try {
    const { mood, note, weather } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }
    
    const newMoodEntry = {
      id: generateId(),
      mood,
      note: note || '',
      weather: weather || null,
      timestamp: new Date().toISOString()
    };
    
    const moods = await readMoods();
    moods.unshift(newMoodEntry); // Add to beginning
    
    // Keep only last 50 entries
    if (moods.length > 50) {
      moods.splice(50);
    }
    
    await writeMoods(moods);
    res.status(201).json(newMoodEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server
initializeDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`🌟 Mood Tracker server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/moods`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
});
