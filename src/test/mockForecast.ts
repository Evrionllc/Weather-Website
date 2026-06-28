import type { AirQualityResponse, ForecastResponse, GeoLocation } from '../types/weather'

/** Deterministic fixtures for rendering tests (no network). */

export const mockLocation: GeoLocation = {
  id: 1,
  name: 'Testville',
  latitude: 51.5,
  longitude: -0.12,
  country: 'Testland',
  admin1: 'Test County',
}

const hours = Array.from({ length: 48 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 5, 25, 0, 0))
  d.setUTCHours(d.getUTCHours() + i)
  return d.toISOString().slice(0, 16)
})

const days = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 5, 25))
  d.setUTCDate(d.getUTCDate() + i)
  return d.toISOString().slice(0, 10)
})

export const mockForecast: ForecastResponse = {
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
  timezone_abbreviation: 'BST',
  utc_offset_seconds: 3600,
  elevation: 25,
  current_units: {},
  current: {
    time: '2026-06-25T12:00',
    interval: 900,
    temperature_2m: 21.4,
    relative_humidity_2m: 55,
    apparent_temperature: 22.1,
    is_day: 1,
    precipitation: 0,
    weather_code: 1,
    cloud_cover: 20,
    surface_pressure: 1013,
    wind_speed_10m: 12,
    wind_direction_10m: 210,
    wind_gusts_10m: 24,
    uv_index: 5,
  },
  hourly_units: {},
  hourly: {
    time: hours,
    temperature_2m: hours.map((_, i) => 18 + Math.sin(i / 3) * 5),
    apparent_temperature: hours.map((_, i) => 18 + Math.sin(i / 3) * 5),
    relative_humidity_2m: hours.map(() => 55),
    precipitation_probability: hours.map((_, i) => (i % 6) * 10),
    precipitation: hours.map(() => 0),
    weather_code: hours.map(() => 1),
    wind_speed_10m: hours.map(() => 12),
    wind_direction_10m: hours.map(() => 210),
    uv_index: hours.map((_, i) => Math.max(0, Math.sin(i / 4) * 6)),
    is_day: hours.map((_, i) => (i % 24 >= 6 && i % 24 <= 20 ? 1 : 0)),
  },
  daily_units: {},
  daily: {
    time: days,
    weather_code: days.map((_, i) => (i % 2 === 0 ? 1 : 61)),
    temperature_2m_max: days.map((_, i) => 22 + i),
    temperature_2m_min: days.map((_, i) => 12 + i),
    apparent_temperature_max: days.map((_, i) => 23 + i),
    sunrise: days.map((d) => `${d}T04:45`),
    sunset: days.map((d) => `${d}T21:20`),
    daylight_duration: days.map(() => 59700),
    uv_index_max: days.map(() => 6),
    precipitation_sum: days.map(() => 1.2),
    precipitation_probability_max: days.map((_, i) => i * 8),
    wind_speed_10m_max: days.map(() => 20),
    wind_direction_10m_dominant: days.map(() => 200),
  },
}

export const mockAirQuality: AirQualityResponse = {
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
  current_units: {},
  current: {
    time: '2026-06-25T12:00',
    us_aqi: 42,
    european_aqi: 30,
    pm2_5: 8.1,
    pm10: 14.2,
    carbon_monoxide: 180,
    nitrogen_dioxide: 12,
    sulphur_dioxide: 3,
    ozone: 64,
  },
}
