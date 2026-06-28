import { Droplets, Gauge, Star, Wind } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ForecastResponse, GeoLocation, UnitPrefs } from '../types/weather'
import { describeCode } from '../lib/weatherCodes'
import { formatTemp, formatWind, windDirection } from '../lib/format'
import { buildSummary } from '../lib/summary'
import { WeatherIcon } from './ui/WeatherIcon'

interface CurrentConditionsProps {
  forecast: ForecastResponse
  location: GeoLocation
  prefs: UnitPrefs
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function CurrentConditions({
  forecast,
  location,
  prefs,
  isFavorite,
  onToggleFavorite,
}: CurrentConditionsProps) {
  const { current } = forecast
  const isDay = current.is_day === 1
  const summary = buildSummary(forecast, prefs)
  const placeLabel = [location.name, location.admin1, location.country].filter(Boolean).join(', ')

  const stats = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${Math.round(current.relative_humidity_2m)}%`,
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${formatWind(current.wind_speed_10m, prefs)} ${windDirection(current.wind_direction_10m)}`,
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${Math.round(current.surface_pressure)} hPa`,
    },
  ]

  return (
    <div className="card relative overflow-hidden p-6 md:p-8">
      {/* soft accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--app-accent)' }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{placeLabel}</p>
          <p className="mt-0.5 text-lg font-medium text-fg">{describeCode(current.weather_code)}</p>
        </div>
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-amber-400"
        >
          <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-amber-400' : ''} />
        </button>
      </div>

      <div className="relative mt-4 flex items-center gap-4">
        <motion.span
          key={Math.round(current.temperature_2m)}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl leading-none font-light tracking-tighter text-fg tabular-nums md:text-8xl"
        >
          {formatTemp(current.temperature_2m)}
        </motion.span>
        <WeatherIcon code={current.weather_code} isDay={isDay} size={72} className="text-accent" />
      </div>

      <p className="relative mt-3 max-w-prose text-fg/90">{summary}</p>
      <p className="relative mt-1 text-sm text-muted">
        Feels like {formatTemp(current.apparent_temperature, true, prefs)}
      </p>

      <dl className="relative mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-surface-2 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              <Icon size={13} /> {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
