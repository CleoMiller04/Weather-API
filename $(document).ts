$(document).ready(function () {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
  const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const forecastUrl = 'https://api.openweathermap.org/data/2.5/onecall';
  const historyList = $('#history-list');
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Function to display current weather
  function displayCurrentWeather(city) {
    $.ajax({
      url: `${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`,
      method: 'GET',
      success: function (response) {
        const currentWeather = $('#current-weather');
        currentWeather.empty();

        // Extract data from the response
        const cityName = response.name;
        const date = new Date(response.dt * 1000).toLocaleDateString();
        const iconUrl = `http://openweathermap.org/img/w/${response.weather[0].icon}.png`;
        const temperature = response.main.temp;
        const humidity = response.main.humidity;
        const windSpeed = response.wind.speed;

        // Create HTML elements to display current weather
        const weatherInfo = `<h2>${cityName} (${date}) <img src="${iconUrl}" alt="Weather Icon"></h2>
                             <p>Temperature: ${temperature} °C</p>
                             <p>Humidity: ${humidity} %</p>
                             <p>Wind Speed: ${windSpeed} m/s</p>`;

        currentWeather.html(weatherInfo);
      }
    });
  }

  // Function to display 5-day forecast using latitude and longitude
  function displayForecast(lat, lon) {
    $.ajax({
      url: `${forecastUrl}?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`,
      method: 'GET',
      success: function (response) {
        const forecast = $('#forecast');
        forecast.empty();

        // Extract data from the response
        const dailyForecast = response.daily;

        // Create HTML elements to display daily forecast
        dailyForecast.forEach(day => {
          const date = new Date(day.dt * 1000).toLocaleDateString();
          const iconUrl = `http://openweathermap.org/img/w/${day.weather[0].icon}.png`;
          const temperature = day.temp.day;
          const humidity = day.humidity;
          const windSpeed = day.wind_speed;

          const forecastInfo = `<div class="forecast-item">
                                  <h3>${date}</h3>
                                  <img src="${iconUrl}" alt="Weather Icon">
                                  <p>Temperature: ${temperature} °C</p>
                                  <p>Humidity: ${humidity} %</p>
                                  <p>Wind Speed: ${windSpeed} m/s</p>
                                </div>`;

          forecast.append(forecastInfo);
        });
      }
    });
  }

  // Function to display search history
  function displayHistory() {
    historyList.empty();
    searchHistory.forEach(city => {
      const listItem = $('<li>').text(city);
      listItem.on('click', function () {
        searchWeather(city);
      });
      historyList.append(listItem);
    });
  }

  // Function to search for weather
  function searchWeather(city) {
    $.ajax({
      url: `${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`,
      method: 'GET',
      success: function (response) {
        const lat = response.coord.lat;
        const lon = response.coord.lon;

        displayCurrentWeather(city);
        displayForecast(lat, lon);

        // Add the city to the search history
        if (!searchHistory.includes(city)) {
          searchHistory.push(city);
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
          displayHistory();
        }
      }
    });
  }

  // Event listener for search button
  $('#search-btn').on('click', function () {
    const cityInput = $('#city-input');
    const city = cityInput.val().trim();

    if (city !== '') {
      searchWeather(city);
      cityInput.val('');
    }
  });

  // Initial display of search history
  displayHistory();
});
