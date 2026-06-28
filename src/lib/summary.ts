import type { ForecastResponse, UnitPrefs } from '../types/weather'
import { describeCode } from './weatherCodes'
import { formatTemp } from './format'

/**
 * Build a one-line, natural-language summary from the raw forecast — the kind of
 * "what does this actually mean" line a person would say, not just numbers.
 */
export function buildSummary(forecast: ForecastResponse, prefs: UnitPrefs): string {
  const { current } = forecast
  const condition = describeCode(current.weather_code).toLowerCase()
  const feels = Math.round(current.apparent_temperature)
  const actual = Math.round(current.temperature_2m)

  const parts: string[] = [`${condition} and ${formatTemp(current.temperature_2m, true, prefs)}`]

  if (Math.abs(feels - actual) >= 3) {
    parts.push(`feels like ${formatTemp(current.apparent_temperature)}`)
  }

  // Look at the next ~12 hours for an incoming change worth flagging.
  const nextHalfDay = upcomingWindow(forecast, 12)
  const maxPrecip = Math.max(0, ...nextHalfDay.precip)
  const willRain = nextHalfDay.precip.findIndex((p) => p >= 50)

  if (current.precipitation > 0) {
    parts.push('precipitation falling now')
  } else if (willRain >= 0) {
    parts.push(`${maxPrecip >= 70 ? 'rain likely' : 'showers possible'} in about ${willRain || 1}h`)
  } else if (maxPrecip < 20 && current.cloud_cover < 30) {
    parts.push('staying clear')
  }

  if (current.wind_speed_10m >= 30) {
    parts.push('breezy')
  }

  const sentence = parts.join(', ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

/** Slice the hourly arrays to the next N hours starting from the current hour. */
export function upcomingWindow(forecast: ForecastResponse, hours: number) {
  const { hourly } = forecast
  const now = Date.now()
  let start = hourly.time.findIndex((t) => new Date(t).getTime() >= now)
  if (start < 0) start = 0
  const end = Math.min(hourly.time.length, start + hours)
  return {
    start,
    end,
    time: hourly.time.slice(start, end),
    temp: hourly.temperature_2m.slice(start, end),
    apparent: hourly.apparent_temperature.slice(start, end),
    precip: hourly.precipitation_probability.slice(start, end),
    precipAmount: hourly.precipitation.slice(start, end),
    code: hourly.weather_code.slice(start, end),
    wind: hourly.wind_speed_10m.slice(start, end),
    windDir: hourly.wind_direction_10m.slice(start, end),
    humidity: hourly.relative_humidity_2m.slice(start, end),
    uv: hourly.uv_index.slice(start, end),
    isDay: hourly.is_day.slice(start, end),
  }
}
