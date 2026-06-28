import { useMemo } from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Clock } from 'lucide-react'
import type { ForecastResponse, UnitPrefs } from '../types/weather'
import { formatHour, formatTemp } from '../lib/format'
import { upcomingWindow } from '../lib/summary'
import { Card, CardTitle } from './ui/Card'
import { WeatherIcon } from './ui/WeatherIcon'

interface HourlyForecastProps {
  forecast: ForecastResponse
  prefs: UnitPrefs
  delay?: number
}

interface Point {
  hour: string
  temp: number
  precip: number
  code: number
  isDay: boolean
}

export function HourlyForecast({ forecast, prefs, delay = 0 }: HourlyForecastProps) {
  const points = useMemo<Point[]>(() => {
    const w = upcomingWindow(forecast, 24)
    return w.time.map((t, i) => ({
      hour: formatHour(t, prefs),
      temp: Math.round(w.temp[i]),
      precip: Math.round(w.precip[i] ?? 0),
      code: w.code[i],
      isDay: w.isDay[i] === 1,
    }))
  }, [forecast, prefs])

  const temps = points.map((p) => p.temp)
  const tempRange = `${Math.min(...temps)}° to ${Math.max(...temps)}°`

  return (
    <Card delay={delay} className="col-span-full" ariaLabel="Hourly forecast">
      <CardTitle icon={<Clock size={14} />}>Next 24 hours</CardTitle>

      {/* Scrollable strip of individual hours */}
      <div className="scroll-x -mx-1 mb-4 flex gap-1 overflow-x-auto pb-2">
        {points.map((p, i) => (
          <div
            key={i}
            className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center"
          >
            <span className="text-xs text-muted">{p.hour}</span>
            <WeatherIcon code={p.code} isDay={p.isDay} size={20} className="text-accent" labelled={false} />
            <span className="text-sm font-medium text-fg tabular-nums">{p.temp}°</span>
            <span className={`text-[10px] tabular-nums ${p.precip >= 30 ? 'text-accent' : 'text-muted'}`}>
              {p.precip}%
            </span>
          </div>
        ))}
      </div>

      {/* Temperature curve + precipitation bars */}
      <div
        className="h-56 w-full"
        role="img"
        aria-label={`Temperature over the next 24 hours, ranging ${tempRange}, with precipitation probability.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--app-border)" vertical={false} />
            <XAxis
              dataKey="hour"
              interval={2}
              tick={{ fill: 'var(--app-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fill: 'var(--app-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => `${v}°`}
            />
            <YAxis yAxisId="precip" hide domain={[0, 100]} />
            <Tooltip content={<HourlyTooltip prefs={prefs} />} cursor={{ stroke: 'var(--app-border)' }} />
            <Bar
              yAxisId="precip"
              dataKey="precip"
              fill="var(--app-accent)"
              opacity={0.25}
              radius={[3, 3, 0, 0]}
              maxBarSize={14}
            />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="var(--app-accent)"
              strokeWidth={2.5}
              fill="url(#tempFill)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: Point }>
  prefs: UnitPrefs
}

function HourlyTooltip({ active, payload, prefs }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="card px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-fg">{p.hour}</p>
      <p className="text-muted">{formatTemp(p.temp, true, prefs)}</p>
      <p className="text-accent">{p.precip}% precip</p>
    </div>
  )
}
