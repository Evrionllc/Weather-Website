import { Wind } from 'lucide-react'
import type { AirQualityResponse } from '../types/weather'
import { aqiFraction, categorizeUsAqi } from '../lib/aqi'
import { Card, CardTitle } from './ui/Card'

interface AirQualityCardProps {
  data: AirQualityResponse
  delay?: number
}

export function AirQualityCard({ data, delay = 0 }: AirQualityCardProps) {
  const { current } = data
  const aqi = Math.round(current.us_aqi)
  const category = categorizeUsAqi(aqi)

  const pollutants = [
    { label: 'PM2.5', value: current.pm2_5, unit: 'µg/m³' },
    { label: 'PM10', value: current.pm10, unit: 'µg/m³' },
    { label: 'O₃', value: current.ozone, unit: 'µg/m³' },
    { label: 'NO₂', value: current.nitrogen_dioxide, unit: 'µg/m³' },
  ]

  return (
    <Card delay={delay} ariaLabel="Air quality">
      <CardTitle icon={<Wind size={14} />}>Air quality</CardTitle>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-light text-fg tabular-nums">{aqi}</span>
        <span className="text-sm font-medium" style={{ color: category.color }}>
          {category.label}
        </span>
        <span className="ml-auto text-xs text-muted">US AQI</span>
      </div>

      {/* Gauge */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${aqiFraction(aqi) * 100}%`, background: category.color }}
        />
      </div>

      <p className="mt-3 text-sm text-muted">{category.advice}</p>

      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        {pollutants.map((p) => (
          <div key={p.label} className="rounded-lg bg-surface-2 py-2">
            <dt className="text-[11px] text-muted">{p.label}</dt>
            <dd className="text-sm font-medium text-fg tabular-nums">{Math.round(p.value)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
