const Weather = ({ weather, capital }) => {
  if (weather === null) {
    return <p>Weather data is not available. Set VITE_WEATHER_API_KEY in a .env file to enable it.</p>
  }
  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p>temperature {weather.main.temp} Celsius</p>
      <img
        src={"https://openweathermap.org/img/wn/" + weather.weather[0].icon + "@2x.png"}
        alt="weather icon"
      />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  )
}

export default Weather
