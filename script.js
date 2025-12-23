const apiKey = "5786942461a9809f045dd6d48bfdb9fe";

function getWeather() {
    const city = document.getElementById("cityInput").value;
    const result = document.getElementById("result");

    if (city === "") {
        result.innerHTML = "Please enter a city name";
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                result.innerHTML = "City not found";
                return;
            }

            result.innerHTML = `
                <h3>${data.name}</h3>
                <p>🌡️ Temp: ${data.main.temp} °C</p>
                <p>☁️ Weather: ${data.weather[0].main}</p>
                <p>💧 Humidity: ${data.main.humidity}%</p>
                <p>🌬️ Wind: ${data.wind.speed} km/h</p>
            `;
        })
        .catch(() => {
            result.innerHTML = "Error fetching data";
        });
}
