// Ensure consistent casing for apiKey
const apiKey = "e6f07872314e283bdba41037d29d6cc8";

// This function now returns a Promise that resolves to the city name and country
function getCityByCoordinates(lat, lon) {
  const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        // Resolving with city name and country
        return `${data[0].name}, ${data[0].country}`;
      } else {
        console.log("City not found");
        return null; // Resolving with null if city not found
      }
    })
    .catch(error => {
      console.log(error);
      return null; // Resolving with null in case of error
    });
}

// findCurrentCity now returns a Promise
function findCurrentCity() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const city = await getCityByCoordinates(position.coords.latitude, position.coords.longitude);
        resolve(city); // Resolving with the city name
      }, () => {
        console.log("Geolocation permission denied or not available.");
        reject("Geolocation permission denied or not available.");
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
      reject("Geolocation is not supported by this browser.");
    }
  });
}

// Setup elements correctly assuming they exist
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search"); // Assuming 'search' is an input

// Updated URL function to use `apiKey` correctly
const url = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

async function getWeatherByLocation(city) {
  const resp = await fetch(url(city));
  const respData = await resp.json();

  console.log(respData);

  addWeatherToPage(respData);
}

function addWeatherToPage(data) {
  const temp = KtoC(data.main.temp);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const weather = document.createElement("div");
  weather.classList.add("weather");

  weather.innerHTML = `
        <h2><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /> ${temp}°C </h2>
        <small>${data.weather[0].main}</small>
        <div class="more-info">
        <p>Humidity: <span>${humidity}%</span></p>
        <p>Wind speed: <span>${Math.trunc(windSpeed * 3.6)} km/h</span></p>
        </div>
    `;

  // Cleanup
  main.innerHTML = "";
  main.appendChild(weather);
}

function KtoC(K) {
  return Math.floor(K - 273.15);
}

// Assuming you have a button with ID 'getWeather' in your form
document.getElementById('getWeather').addEventListener('click', async function(e) {
  e.preventDefault(); // Preventing the form from submitting traditionally

  // Using the asynchronous nature of findCurrentCity to get the city name
  findCurrentCity().then(city => {
    if (city) {
      getWeatherByLocation(city.split(',')[0]); // Assuming you only need the city name, not the country
    }
  }).catch(error => console.log(error));
});
