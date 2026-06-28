/**
 * TypeScript shapes for the Open-Meteo APIs we consume, plus a few app-level
 * types. These mirror the JSON returned by:
 *   - Forecast:    https://api.open-meteo.com/v1/forecast
 *   - Air Quality: https://air-quality-api.open-meteo.com/v1/air-quality
 *   - Geocoding:   https://geocoding-api.open-meteo.com/v1/search
 *
 * Open-Meteo returns weather variables as parallel arrays keyed by an index in
 * the `time` array, which is why most fields below are `number[]` / `string[]`.
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type WindSpeedUnit = 'kmh' | 'mph'
export type TimeFormat = '12h' | '24h'

export interface UnitPrefs {
  temperature: TemperatureUnit
  wind: WindSpeedUnit
  time: TimeFormat
}

/** A resolved place the dashboard can show weather for. */
export interface GeoLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  countryCode?: string
  admin1?: string
  timezone?: string
}

/* ------------------------------- Forecast -------------------------------- */

export interface ForecastResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
  elevation: number
  current_units: Record<string, string>
  current: CurrentWeather
  hourly_units: Record<string, string>
  hourly: HourlyWeather
  daily_units: Record<string, string>
  daily: DailyWeather
}

export interface CurrentWeather {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: 0 | 1
  precipitation: number
  weather_code: number
  cloud_cover: number
  surface_pressure: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
  uv_index: number
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  relative_humidity_2m: number[]
  precipitation_probability: number[]
  precipitation: number[]
  weather_code: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  uv_index: number[]
  is_day: number[]
}

export interface DailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  apparent_temperature_max: number[]
  sunrise: string[]
  sunset: string[]
  daylight_duration: number[]
  uv_index_max: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
  wind_direction_10m_dominant: number[]
}

/* ------------------------------ Air Quality ------------------------------ */

export interface AirQualityResponse {
  latitude: number
  longitude: number
  timezone: string
  current_units: Record<string, string>
  current: AirQualityCurrent
}

export interface AirQualityCurrent {
  time: string
  us_aqi: number
  european_aqi: number
  pm2_5: number
  pm10: number
  carbon_monoxide: number
  nitrogen_dioxide: number
  sulphur_dioxide: number
  ozone: number
}

/* ------------------------------- Geocoding ------------------------------- */

export interface GeocodingResponse {
  results?: GeocodingResult[]
  generationtime_ms: number
}

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  timezone?: string
}
