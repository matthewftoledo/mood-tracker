# 🌤️ Mood Tracker

A simple web application to track your daily moods alongside weather data.

## Features

- **Mood Logging**: Track 5 different moods (Happy, Excited, Neutral, Sad, Stressed)
- **Weather Integration**: Automatically fetches current weather data
- **Mood History**: View your recent mood entries
- **Weekly Stats**: See your mood patterns for the past week
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: JSON file (easily upgradeable to database)
- **Weather API**: OpenWeatherMap

## Quick Start

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

## Project Structure

```
mood-tracker/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Dependencies
│   └── data/
│       └── moods.json     # Data storage
├── frontend/
│   ├── index.html         # Main page
│   ├── style.css          # Styling
│   └── script.js          # Frontend logic
└── README.md
```

## API Endpoints

- `GET /api/moods` - Get all mood entries
- `POST /api/moods` - Create new mood entry
- `GET /api/weather/:city` - Get weather data for a city

## Mood Entry Format

```json
{
  "id": "unique-id",
  "mood": "happy|excited|neutral|sad|stressed",
  "note": "Optional note",
  "weather": {
    "temp": 22,
    "description": "partly cloudy",
    "city": "San Francisco"
  },
  "timestamp": "2025-08-13T21:32:56Z"
}
```

## Deployment Options

- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: Upgrade to MongoDB, PostgreSQL, or SQLite

## Future Enhancements

- [ ] User authentication
- [ ] Data visualization with charts
- [ ] Export data as CSV
- [ ] Mood correlation insights
- [ ] Mobile app version
- [ ] Reminder notifications

## Development

Built in ~30 minutes as a simple full-stack web application demonstration.

Weather data provided by [OpenWeatherMap](https://openweathermap.org/).

---

**Happy mood tracking! 🌟**
