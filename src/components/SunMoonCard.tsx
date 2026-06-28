import { Sunrise, Sunset } from 'lucide-react'
import type { ForecastResponse, UnitPrefs } from '../types/weather'
import { formatClock, formatDuration, parseLocalIso } from '../lib/format'
import { moonPhase } from '../lib/moon'
import { Card, CardTitle } from './ui/Card'

interface SunMoonCardProps {
  forecast: ForecastResponse
  prefs: UnitPrefs
  delay?: number
}

export function SunMoonCard({ forecast, prefs, delay = 0 }: SunMoonCardProps) {
  const { daily } = forecast
  const sunriseIso = daily.sunrise[0]
  const sunsetIso = daily.sunset[0]
  const sunrise = parseLocalIso(sunriseIso).getTime()
  const sunset = parseLocalIso(sunsetIso).getTime()

  // Position of "now" along the daylight arc (clamped to 0–1).
  const nowLocal = parseLocalIso(forecast.current.time).getTime()
  const progress = Math.max(0, Math.min(1, (nowLocal - sunrise) / Math.max(1, sunset - sunrise)))

  const moon = moonPhase(new Date())

  // Semicircle arc geometry.
  const angle = Math.PI * (1 - progress)
  const cx = 100 + 90 * Math.cos(angle)
  const cy = 100 - 90 * Math.sin(angle)

  return (
    <Card delay={delay} ariaLabel="Sun and moon">
      <CardTitle icon={<Sunrise size={14} />}>Sun &amp; moon</CardTitle>

      <svg viewBox="0 0 200 116" className="mt-1 w-full" role="img" aria-label="Daylight arc">
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="var(--app-border)" strokeWidth="2" />
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke="var(--app-accent)"
          strokeWidth="3"
          strokeDasharray={Math.PI * 90}
          strokeDashoffset={Math.PI * 90 * (1 - progress)}
          strokeLinecap="round"
        />
        {progress > 0 && progress < 1 && (
          <circle cx={cx} cy={cy} r="6" fill="var(--app-accent)" />
        )}
      </svg>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Sunrise size={16} className="text-amber-400" />
          <span className="text-fg">{formatClock(sunriseIso, prefs)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sunset size={16} className="text-orange-400" />
          <span className="text-fg">{formatClock(sunsetIso, prefs)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <div>
          <p className="text-xs text-muted">Day length</p>
          <p className="text-fg">{formatDuration(daily.daylight_duration[0])}</p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-xs text-muted">{moon.label}</p>
            <p className="text-fg">{Math.round(moon.illumination * 100)}% lit</p>
          </div>
          <span className="text-2xl" aria-hidden="true">
            {moon.emoji}
          </span>
        </div>
      </div>
    </Card>
  )
}
