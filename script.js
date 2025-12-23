const apiKey = "5786942461a9809f045dd6d48bfdb9fe";

const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");
const infoCard = document.getElementById("infoCard");

button.addEventListener("click", searchWeather);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchWeather();
});

function searchWeather() {
    const city = input.value.trim();
    if (!city) return;

    infoCard.innerHTML = "<h2>Loading...</h2>";

    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    )
        .then(res => res.json())
        .then(data => {
            console.log(data); // debug

            if (!data.weather) {
                infoCard.innerHTML = "<h2>City not found</h2>";
                return;
            }

            renderWeather(data);
        })
        .catch(() => {
            infoCard.innerHTML = "<h2>Error fetching data</h2>";
        });
}

function renderWeather(data) {
    const weather = data.weather[0].main;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    let icon = "🌡️";
    if (weather === "Clear") icon = "☀️";
    else if (weather === "Clouds") icon = "☁️";
    else if (weather === "Rain") icon = "🌧️";
    else if (weather === "Snow") icon = "❄️";
    else if (weather === "Thunderstorm") icon = "⛈️";
    else if (weather === "Mist" || weather === "Haze") icon = "🌫️";

    infoCard.innerHTML = `
        <h2>${data.name}</h2>
        <div class="weather-icon">${icon}</div>
        <p><strong>${temp}°C</strong> — ${weather}</p>
        <p>💧 Humidity: ${humidity}%</p>
        <p>🌬️ Wind: ${wind} km/h</p>
    `;
}
