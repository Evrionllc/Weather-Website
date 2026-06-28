import { buildUrl, getJson } from './client'
import type {
  AirQualityResponse,
  ForecastResponse,
  GeoLocation,
  GeocodingResponse,
  UnitPrefs,
} from '../types/weather'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
]

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
  'is_day',
]

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'sunrise',
  'sunset',
  'daylight_duration',
  'uv_index_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
]

export function fetchForecast(
  lat: number,
  lon: number,
  units: UnitPrefs,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const url = buildUrl(FORECAST_URL, {
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    temperature_unit: units.temperature,
    wind_speed_unit: units.wind,
    timezone: 'auto',
    forecast_days: 10,
  })
  return getJson<ForecastResponse>(url, signal)
}

export function fetchAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQualityResponse> {
  const url = buildUrl(AIR_QUALITY_URL, {
    latitude: lat,
    longitude: lon,
    current: [
      'us_aqi',
      'european_aqi',
      'pm2_5',
      'pm10',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
    ],
    timezone: 'auto',
  })
  return getJson<AirQualityResponse>(url, signal)
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<GeoLocation[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = buildUrl(GEOCODING_URL, {
    name: trimmed,
    count: 8,
    language: 'en',
    format: 'json',
  })
  const data = await getJson<GeocodingResponse>(url, signal)
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1,
    timezone: r.timezone,
  }))
}

/** Reverse geocode a lat/lon (used after browser geolocation) for a friendly label. */
export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<GeoLocation> {
  // Open-Meteo has no public reverse endpoint; we resolve a label by searching
  // nearby and picking the closest result, falling back to coordinates.
  const fallback: GeoLocation = {
    id: Math.round((lat + 90) * 1000 + (lon + 180)),
    name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    latitude: lat,
    longitude: lon,
  }
  try {
    const url = buildUrl('https://nominatim.openstreetmap.org/reverse', {
      lat,
      lon,
      format: 'jsonv2',
      zoom: 10,
    })
    const data = await getJson<{
      address?: {
        city?: string
        town?: string
        village?: string
        state?: string
        country?: string
        country_code?: string
      }
    }>(url, signal)
    const a = data.address
    if (!a) return fallback
    const name = a.city || a.town || a.village || a.state || fallback.name
    return {
      ...fallback,
      name,
      admin1: a.state,
      country: a.country,
      countryCode: a.country_code?.toUpperCase(),
    }
  } catch {
    return fallback
  }
}
