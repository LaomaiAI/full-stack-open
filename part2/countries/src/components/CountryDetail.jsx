import Weather from "./Weather"

const CountryDetail = ({ country, weather }) => {
  const capital = country.capital && country.capital[0]
  const languages = Object.values(country.languages || {})
  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>capital {capital}</p>
      <p>area {country.area}</p>
      <h3>languages:</h3>
      <ul>
        {languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={"flag of " + country.name.common} width="150" />
      <Weather weather={weather} capital={capital} />
    </div>
  )
}

export default CountryDetail
