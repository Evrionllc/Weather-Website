import { Activity, Sun } from 'lucide-react'
import type { ForecastResponse, UnitPrefs } from '../types/weather'
import { runningScore, toCelsius, uvGuidance } from '../lib/insights'
import { upcomingWindow } from '../lib/summary'
import { Card, CardTitle } from './ui/Card'

interface InsightsCardProps {
  forecast: ForecastResponse
  prefs: UnitPrefs
  delay?: number
}

/**
 * The "shows analytical skill" card: a running-conditions score and UV exposure
 * guidance, both computed from raw fields Open-Meteo doesn't surface directly.
 */
export function InsightsCard({ forecast, prefs, delay = 0 }: InsightsCardProps) {
  const { current } = forecast

  // Normalise to the units the index expects (Celsius, km/h, %).
  const apparentC = toCelsius(current.apparent_temperature, prefs.temperature)
  const windKmh = prefs.wind === 'mph' ? current.wind_speed_10m * 1.60934 : current.wind_speed_10m
  const next3 = upcomingWindow(forecast, 3).precip
  const precipProbability = Math.max(0, ...next3)

  const running = runningScore({
    apparentC,
    humidity: current.relative_humidity_2m,
    windKmh,
    precipProbability,
    uvIndex: current.uv_index,
  })
  const uv = uvGuidance(current.uv_index)

  // Circular gauge geometry.
  const r = 34
  const circumference = 2 * Math.PI * r
  const dash = (running.score / 100) * circumference

  return (
    <Card delay={delay} ariaLabel="Activity insights">
      <CardTitle icon={<Activity size={14} />}>Run conditions</CardTitle>

      <div className="flex items-center gap-4">
        <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0 -rotate-90" role="img" aria-label={`Running score ${running.score} of 100`}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--app-surface-2)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={running.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700"
          />
          <text x="40" y="40" transform="rotate(90 40 40)" textAnchor="middle" dominantBaseline="central" className="fill-fg text-[18px] font-semibold">
            {running.score}
          </text>
        </svg>
        <div>
          <p className="text-lg font-medium" style={{ color: running.color }}>
            {running.rating}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {running.factors.length > 0
              ? running.factors.join(' · ')
              : 'Comfortable across the board.'}
          </p>
        </div>
      </div>

      {/* UV exposure */}
      <div className="mt-4 flex items-start gap-2 border-t border-border pt-3">
        <Sun size={16} className="mt-0.5 shrink-0" style={{ color: uv.color }} />
        <div>
          <p className="text-sm text-fg">
            UV {Math.round(current.uv_index)} ·{' '}
            <span style={{ color: uv.color }}>{uv.level}</span>
            {uv.burnMinutes ? <span className="text-muted"> · burns in ~{uv.burnMinutes} min</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-muted">{uv.advice}</p>
        </div>
      </div>
    </Card>
  )
}
