import { CalendarDays, Droplet } from 'lucide-react'
import type { DailyWeather, ForecastResponse, UnitPrefs } from '../types/weather'
import { formatDayLabel } from '../lib/format'
import { Card, CardTitle } from './ui/Card'
import { WeatherIcon } from './ui/WeatherIcon'

interface DailyForecastProps {
  forecast: ForecastResponse
  prefs: UnitPrefs
  delay?: number
}

export function DailyForecast({ forecast, prefs: _prefs, delay = 0 }: DailyForecastProps) {
  const daily = forecast.daily
  // Overall range across the week so each day's bar is positioned consistently.
  const weekMin = Math.min(...daily.temperature_2m_min)
  const weekMax = Math.max(...daily.temperature_2m_max)
  const span = Math.max(1, weekMax - weekMin)

  return (
    <Card delay={delay} ariaLabel="Daily forecast">
      <CardTitle icon={<CalendarDays size={14} />}>10-day forecast</CardTitle>
      <ul className="flex flex-col">
        {daily.time.map((date, i) => (
          <DailyRow key={date} daily={daily} index={i} date={date} weekMin={weekMin} span={span} />
        ))}
      </ul>
    </Card>
  )
}

interface DailyRowProps {
  daily: DailyWeather
  index: number
  date: string
  weekMin: number
  span: number
}

function DailyRow({ daily, index, date, weekMin, span }: DailyRowProps) {
  const min = daily.temperature_2m_min[index]
  const max = daily.temperature_2m_max[index]
  const precip = daily.precipitation_probability_max[index] ?? 0
  const offset = ((min - weekMin) / span) * 100
  const width = ((max - min) / span) * 100

  return (
    <li className="grid grid-cols-[3.5rem_1.75rem_2.75rem_1fr] items-center gap-3 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted">{formatDayLabel(date, index)}</span>
      <WeatherIcon code={daily.weather_code[index]} isDay size={20} className="text-accent" />
      <span className="flex items-center gap-0.5 text-xs text-accent tabular-nums">
        {precip > 0 ? (
          <>
            <Droplet size={11} /> {precip}%
          </>
        ) : null}
      </span>
      <div className="flex items-center gap-2">
        <span className="w-7 text-right text-muted tabular-nums">{Math.round(min)}°</span>
        <div className="relative h-1.5 flex-1 rounded-full bg-surface-2">
          <div
            className="absolute h-1.5 rounded-full"
            style={{
              left: `${offset}%`,
              width: `${Math.max(width, 6)}%`,
              background: 'linear-gradient(90deg, var(--app-accent), #fbbf24)',
            }}
          />
        </div>
        <span className="w-7 text-fg tabular-nums">{Math.round(max)}°</span>
      </div>
    </li>
  )
}
