class MoodTracker {
    constructor() {
        this.selectedMood = null;
        this.currentWeather = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWeather();
        this.loadMoodHistory();
        this.updateStats();
    }

    setupEventListeners() {
        // Mood button selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(e.target.dataset.mood, e.target);
            });
        });

        // Form submission
        document.getElementById('mood-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMood();
        });
    }

    selectMood(mood, buttonElement) {
        this.selectedMood = mood;
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        // Enable submit button
        document.getElementById('submit-btn').disabled = false;
    }

    async loadWeather() {
        try {
            // Try to get user's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    },
                    () => {
                        // Fallback to default city
                        this.getWeatherByCity('San Francisco');
                    }
                );
            } else {
                this.getWeatherByCity('San Francisco');
            }
        } catch (error) {
            console.error('Weather loading error:', error);
            this.showMockWeather();
        }
    }

    async getWeatherByCity(city) {
        try {
            const response = await fetch(`/api/weather/${city}`);
            const weather = await response.json();
            this.displayWeather(weather);
            this.currentWeather = weather;
        } catch (error) {
            console.error('Weather API error:', error);
            this.showMockWeather();
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            // For simplicity, we'll use a major city name
            // In a real app, you'd use lat/lon directly with the weather API
            this.getWeatherByCity('Current Location');
        } catch (error) {
            this.getWeatherByCity('San Francisco');
        }
    }

    displayWeather(weather) {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = `
            <div class="weather-display">
                <div class="weather-temp">${weather.temp}°C</div>
                <div class="weather-details">
                    <div class="weather-desc">${weather.description}</div>
                    <div class="weather-city">${weather.city}</div>
                </div>
            </div>
        `;
    }

    showMockWeather() {
        const mockWeather = {
            temp: 22,
            description: 'partly cloudy',
            city: 'Your Location'
        };
        this.displayWeather(mockWeather);
        this.currentWeather = mockWeather;
    }

    async submitMood() {
        if (!this.selectedMood) return;

        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const moodData = {
                mood: this.selectedMood,
                note: document.getElementById('mood-note').value.trim(),
                weather: this.currentWeather
            };

            const response = await fetch('/api/moods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(moodData)
            });

            if (response.ok) {
                // Success feedback
                this.showSuccessMessage('Mood logged successfully! 🎉');
                
                // Reset form
                this.resetForm();
                
                // Reload data
                this.loadMoodHistory();
                this.updateStats();
            } else {
                throw new Error('Failed to save mood');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showErrorMessage('Failed to save mood. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
        }
    }

    resetForm() {
        // Reset mood selection
        this.selectedMood = null;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Clear note
        document.getElementById('mood-note').value = '';

        // Disable submit button
        document.getElementById('submit-btn').disabled = true;
    }

    async loadMoodHistory() {
        try {
            const response = await fetch('/api/moods');
            const moods = await response.json();
            this.displayMoodHistory(moods);
        } catch (error) {
            console.error('History loading error:', error);
            document.getElementById('mood-history').innerHTML = 
                '<div style="color: #666; font-style: italic;">Unable to load mood history</div>';
        }
    }

    displayMoodHistory(moods) {
        const historyContainer = document.getElementById('mood-history');
        
        if (moods.length === 0) {
            historyContainer.innerHTML = 
                '<div style="color: #666; font-style: italic;">No moods logged yet. Start by logging your first mood!</div>';
            return;
        }

        const moodEmojis = {
            happy: '😊',
            excited: '🤩',
            neutral: '😐',
            sad: '😢',
            stressed: '😰'
        };

        historyContainer.innerHTML = moods.slice(0, 10).map(mood => `
            <div class="mood-entry">
                <div class="mood-entry-emoji">${moodEmojis[mood.mood] || '😐'}</div>
                <div class="mood-entry-content">
                    <div class="mood-entry-header">
                        <div class="mood-entry-mood">${mood.mood}</div>
                        <div class="mood-entry-time">${this.formatTime(mood.timestamp)}</div>
                    </div>
                    ${mood.note ? `<div class="mood-entry-note">"${mood.note}"</div>` : ''}
                    ${mood.weather ? `
                        <div class="mood-entry-weather">
                            🌤️ ${mood.weather.temp}°C, ${mood.weather.description} in ${mood.weather.city}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    async updateStats() {
        try {
            const response = await fetch('/api/moods');
            const moods = await response.json();
            
            // Calculate stats for the last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const recentMoods = moods.filter(mood => 
                new Date(mood.timestamp) > weekAgo
            );

            const stats = {
                happy: 0,
                excited: 0,
                neutral: 0,
                sad: 0,
                stressed: 0
            };

            recentMoods.forEach(mood => {
                if (stats.hasOwnProperty(mood.mood)) {
                    stats[mood.mood]++;
                }
            });

            // Update UI
            Object.keys(stats).forEach(mood => {
                const element = document.getElementById(`${mood}-count`);
                if (element) {
                    element.textContent = stats[mood];
                }
            });
        } catch (error) {
            console.error('Stats update error:', error);
        }
    }

    showSuccessMessage(message) {
        // Remove existing messages
        const existing = document.querySelector('.success-message');
        if (existing) existing.remove();

        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;

        // Insert after weather widget
        const weatherWidget = document.querySelector('.weather-widget');
        weatherWidget.insertAdjacentElement('afterend', successDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    showErrorMessage(message) {
        alert(message); // Simple error handling for now
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoodTracker();
});
