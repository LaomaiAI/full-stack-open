import { useState, useEffect } from "react"
import CountryDetail from "./components/CountryDetail"
import countryService from "./services/countries"
import weatherService from "./services/weather"

const apiKey = import.meta.env.VITE_WEATHER_API_KEY

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    countryService.getAll().then((initialCountries) => {
      setCountries(initialCountries)
    })
  }, [])

  const filteredCountries =
    search === ""
      ? []
      : countries.filter((country) => country.name.common.toLowerCase().includes(search.toLowerCase()))

  const countryToShow =
    selectedCountry || (filteredCountries.length === 1 ? filteredCountries[0] : null)

  useEffect(() => {
    if (!countryToShow) {
      setWeather(null)
      return
    }
    if (!apiKey) {
      setWeather(null)
      return
    }
    const capital = countryToShow.capital && countryToShow.capital[0]
    if (!capital) {
      setWeather(null)
      return
    }
    weatherService
      .getWeather(capital, apiKey)
      .then((weatherData) => setWeather(weatherData))
      .catch(() => setWeather(null))
  }, [countryToShow])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null)
  }

  return (
    <div>
      <div>
        find countries <input value={search} onChange={handleSearchChange} />
      </div>
      {countryToShow ? (
        <CountryDetail country={countryToShow} weather={weather} />
      ) : filteredCountries.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : (
        filteredCountries.map((country) => (
          <p key={country.cca3}>
            {country.name.common} 
            <button onClick={() => setSelectedCountry(country)}>show</button>
          </p>
        ))
      )}
    </div>
  )
}

export default App
