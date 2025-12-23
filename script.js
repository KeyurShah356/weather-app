const apiKey = "5786942461a9809f045dd6d48bfdb9fe";


const input = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const infoCard = document.getElementById("infoCard");
const toggleUnitBtn = document.getElementById("toggleUnit");

let isCelsius = true;
let lastCity = "";

searchBtn.addEventListener("click", () => searchWeather(input.value));
input.addEventListener("keydown", e => { if(e.key==="Enter") searchWeather(input.value); });
geoBtn.addEventListener("click", geoWeather);
toggleUnitBtn.addEventListener("click", toggleUnit);

function toggleUnit() {
    isCelsius = !isCelsius;
    toggleUnitBtn.textContent = isCelsius ? "Show in °F" : "Show in °C";
    if(lastCity) searchWeather(lastCity);
}

function searchWeather(city) {
    if(!city) return;
    lastCity = city;
    infoCard.innerHTML = "<h2>Loading...</h2>";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`)
        .then(res=>res.json())
        .then(data=>{
            if(!data.weather){ infoCard.innerHTML="<h2>City not found</h2>"; return; }
            renderCurrentWeather(data);
            getHourlyForecast(data.coord.lat, data.coord.lon);
            get5DayForecast(city);
        })
        .catch(()=> infoCard.innerHTML="<h2>Error fetching data</h2>");
}

function geoWeather() {
    if(!navigator.geolocation){ alert("Geolocation not supported"); return; }
    infoCard.innerHTML="<h2>Fetching your location...</h2>";

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(res=>res.json())
            .then(data=>{
                if(!data.weather){ infoCard.innerHTML="<h2>Location not found</h2>"; return; }
                lastCity = data.name;
                renderCurrentWeather(data);
                getHourlyForecast(lat, lon);
                get5DayForecast(data.name);
            });
    }, ()=>{ alert("Location access denied"); });
}

function renderCurrentWeather(data) {
    let temp = data.main.temp;
    if(!isCelsius) temp = temp*9/5+32;

    const weather = data.weather[0].main;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const icon = getWeatherIcon(weather);

    infoCard.innerHTML = `
        <h2>${data.name}</h2>
        <div class="weather-icon">${icon}</div>
        <p><strong>${Math.round(temp)}°${isCelsius?"C":"F"}</strong> — ${weather}</p>
        <p>💧 Humidity: ${humidity}%</p>
        <p>🌬️ Wind: ${wind} km/h</p>
        <div class="forecast-heading">Hourly Forecast</div>
        <div class="hourly-container"></div>
        <div class="forecast-heading">5-Day Forecast</div>
        <div class="forecast-container"></div>
    `;
}

/* ============================
   NEW: One Call API Hourly Forecast
============================ */
function getHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`)
        .then(res=>res.json())
        .then(data=>{
            const next5Hours = data.hourly.slice(0,6); // current hour + next 5 hours
            renderHourlyForecast(next5Hours);
        });
}

function renderHourlyForecast(hours){
    const container = infoCard.querySelector(".hourly-container");
    container.innerHTML="";

    hours.forEach(h=>{
        let temp = h.temp;
        if(!isCelsius) temp = temp*9/5+32;
        const icon = getWeatherIcon(h.weather[0].main);
        const hour = new Date(h.dt * 1000).getHours();
        const ampm = hour>=12?"PM":"AM";
        const hr = hour%12||12;

        const card = document.createElement("div");
        card.className="hourly-card";
        card.innerHTML = `
            <p>${hr}${ampm}</p>
            <div class="weather-icon">${icon}</div>
            <p>${Math.round(temp)}°${isCelsius?"C":"F"}</p>
        `;
        container.appendChild(card);
    });
}

/* ============================
   5-Day Forecast (unchanged)
============================ */
function get5DayForecast(city){
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`)
        .then(res=>res.json())
        .then(data=>{
            if(!data.list) return;
            const daily = extractDailyForecast(data.list);
            render5DayForecast(daily);
        });
}

function extractDailyForecast(list){
    const map={};
    list.forEach(item=>{
        const date = item.dt_txt.split(" ")[0];
        if(!map[date]) map[date]=[];
        map[date].push(item);
    });

    const daily = Object.keys(map).map(date=>{
        const temps = map[date].map(i=>i.main.temp);
        const weathers = map[date].map(i=>i.weather[0].main);
        const weather = mode(weathers);
        return {date, temp_min: Math.min(...temps), temp_max: Math.max(...temps), weather};
    });
    return daily.slice(0,5);
}

function render5DayForecast(daily){
    const container = infoCard.querySelector(".forecast-container");
    container.innerHTML="";
    daily.forEach(day=>{
        let tmax = day.temp_max;
        let tmin = day.temp_min;
        if(!isCelsius){ tmax = tmax*9/5+32; tmin = tmin*9/5+32; }

        const card = document.createElement("div");
        card.className="forecast-card";
        card.innerHTML = `
            <p>${new Date(day.date).toLocaleDateString('en-US',{weekday:'short'})}</p>
            <div class="weather-icon">${getWeatherIcon(day.weather)}</div>
            <p>${Math.round(tmax)}° / ${Math.round(tmin)}°${isCelsius?"C":"F"}</p>
        `;
        container.appendChild(card);
    });
}

function getWeatherIcon(weather){
    switch(weather){
        case "Clear": return "☀️";
        case "Clouds": return "☁️";
        case "Rain": return "🌧️";
        case "Drizzle": return "🌦️";
        case "Thunderstorm": return "⛈️";
        case "Snow": return "❄️";
        case "Mist":
        case "Haze":
        case "Fog": return "🌫️";
        default: return "🌡️";
    }
}

function mode(arr){ return arr.sort((a,b)=>arr.filter(v=>v===a).length-arr.filter(v=>v===b).length).pop(); }
