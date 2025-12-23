const apiKey = "5786942461a9809f045dd6d48bfdb9fe";

function getWeather() {
    const city = document.getElementById("cityInput").value;
    const result = document.getElementById("result");

    if (city === "") {
        result.innerHTML = "❌ Please enter a city name";
        return;
    }

    result.innerHTML = "🔄 Loading...";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                result.innerHTML = "❌ City not found";
                return;
            }

            const weather = data.weather[0].main;

            let icon = "🌡️";

            if (weather === "Clear") icon = "☀️";
            else if (weather === "Clouds") icon = "☁️";
            else if (weather === "Rain") icon = "🌧️";
            else if (weather === "Drizzle") icon = "🌦️";
            else if (weather === "Thunderstorm") icon = "⛈️";
            else if (weather === "Snow") icon = "❄️";
            else if (weather === "Mist" || weather === "Haze") icon = "🌫️";

            result.innerHTML = `
                <h3>${data.name}</h3>

                <div class="weather-icon">${icon}</div>

                <p>🌡️ Temp: ${data.main.temp} °C</p>
                <p>Weather: ${weather}</p>
                <p>💧 Humidity: ${data.main.humidity}%</p>
                <p>🌬️ Wind: ${data.wind.speed} km/h</p>
            `;
        })
        .catch(() => {
            result.innerHTML = "⚠️ Error fetching data";
        });
}
