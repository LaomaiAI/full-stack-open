import axios from "axios"

const baseUrl = "https://api.openweathermap.org/data/2.5/weather"

const getWeather = (capital, apiKey) => {
  const request = axios.get(baseUrl, {
    params: { q: capital, appid: apiKey, units: "metric" },
  })
  return request.then((response) => response.data)
}

export default { getWeather }
