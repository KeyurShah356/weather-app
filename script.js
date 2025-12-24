const apiKey = "5786942461a9809f045dd6d48bfdb9fe";



function searchCity() {
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(`q=${city}`);
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    });
}

function fetchWeather(query) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            showCurrent(data);
            fetchAQI(data.coord.lat, data.coord.lon);
            fetchForecast(data.coord.lat, data.coord.lon);
        });
}

/* CURRENT WEATHER */
function showCurrent(d) {
    currentWeather.innerHTML = `
        <h2>${d.name}</h2>
        <h1>${Math.round(d.main.temp)}°C</h1>
        <p>${d.weather[0].description}</p>

        <div class="stats">
            <div class="stat">Feels Like<br>${Math.round(d.main.feels_like)}°C</div>
            <div class="stat">Pressure<br>${d.main.pressure} hPa</div>
            <div class="stat">Visibility<br>${d.visibility / 1000} km</div>
            <div class="stat">Sunrise<br>${formatTime(d.sys.sunrise, d.timezone)}</div>
            <div class="stat">Sunset<br>${formatTime(d.sys.sunset, d.timezone)}</div>
        </div>

        <div id="aqi" class="aqi">Loading AQI...</div>
    `;
}

/* AQI */
function fetchAQI(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(res => res.json())
        .then(d => {
            const aqi = d.list[0].main.aqi;
            const labels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const colors = ["", "#2ecc71", "#9acd32", "#f1c40f", "#e67e22", "#e74c3c"];
            const box = document.getElementById("aqi");
            box.innerText = `Air Quality: ${aqi} (${labels[aqi]})`;
            box.style.background = colors[aqi];
        });
}

/* FORECAST */
function fetchForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(d => {

            // 🔥 SHOW forecast block NOW
            document.getElementById("forecastBlock").style.display = "block";

            hourly.innerHTML = "";
            daily.innerHTML = "";

            // Hourly
            d.list.slice(0, 5).forEach(h => {
                hourly.innerHTML += `
                    <div class="hour">
                        <div>${getHour(h.dt, d.city.timezone)}</div>
                        <div>${Math.round(h.main.temp)}°C</div>
                    </div>
                `;
            });

            // 5 Day
            for (let i = 0; i < d.list.length; i += 8) {
                const day = d.list[i];
                daily.innerHTML += `
                    <div class="stat">
                        ${new Date(day.dt * 1000).toDateString().slice(0, 10)}<br>
                        ${Math.round(day.main.temp)}°C
                    </div>
                `;
            }
        });
}


/* TIME FIX */
function formatTime(t, offset) {
    return new Date((t + offset) * 1000).toUTCString().slice(-12, -4);
}

function getHour(t, offset) {
    return new Date((t + offset) * 1000).getUTCHours() + ":00";
}
