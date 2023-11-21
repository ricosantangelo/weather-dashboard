const apiKey = "97afa07d08bf571a21968e78b3cfda08"; 
const searchButton = document.getElementById('search-button');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const forecastDisplay = document.getElementById('forecast-display');
const searchHistoryDiv = document.getElementById('search-history');
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

searchButton.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        saveSearchHistory(cityName);
        getWeatherData(cityName);
    } else {
        alert('Please enter a city name.');
    }
});

async function getWeatherData(cityName) {
    try {
        let geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
        let geoResponse = await fetch(geoUrl);
        let geoData = await geoResponse.json();

        if (geoData.length === 0) {
            weatherDisplay.textContent = 'City not found.';
            return;
        }

        let { lat, lon } = geoData[0];
        let weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        let weatherResponse = await fetch(weatherUrl);
        let weatherData = await weatherResponse.json();

        displayWeatherData(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherDisplay.innerHTML = `<p>Error fetching weather data. Please try again later.</p>`;
        forecastDisplay.innerHTML = '';
    }
}

function displayWeatherData(data) {
    const currentWeather = data.list[0];
    const cityName = data.city.name;
    const currentDate = new Date(currentWeather.dt * 1000).toLocaleDateString('en-US');

    weatherDisplay.innerHTML = `
        <h2>${cityName} (${currentDate})</h2>
        <p>Temp: ${currentWeather.main.temp.toFixed(2)}°F</p>
        <p>Wind: ${currentWeather.wind.speed.toFixed(2)} MPH</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
    `;

    let forecastHtml = '<h2>5-Day Forecast:</h2><div class="forecast-container">';
    for (let i = 8; i < data.list.length; i += 8) { // Every 8th item in the array is approximately one day apart
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US');
        forecastHtml += `
            <div class="forecast">
                <h3>${date}</h3>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" />
                <p>Temp: ${forecast.main.temp.toFixed(2)}°F</p>
                <p>Wind: ${forecast.wind.speed.toFixed(2)} MPH</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            </div>
        `;
    }
    forecastHtml += '</div>';
    forecastDisplay.innerHTML = forecastHtml;
}

function saveSearchHistory(cityName) {
    if (!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        updateSearchHistoryUI();
    }
}

function updateSearchHistoryUI() {
    searchHistoryDiv.innerHTML = '<h3>Search History</h3>';
    searchHistory.forEach(city => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.classList.add('history-btn');
        cityButton.addEventListener('click', () => getWeatherData(city));
        searchHistoryDiv.appendChild(cityButton);
    });
}

window.onload = updateSearchHistoryUI;
