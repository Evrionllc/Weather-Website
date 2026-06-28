import { iconForCode, describeCode } from '../../lib/weatherCodes'

interface WeatherIconProps {
  code: number
  isDay: boolean
  size?: number
  className?: string
  /** When false, the icon is decorative and hidden from screen readers. */
  labelled?: boolean
}

/**
 * Renders the Lucide icon for a WMO weather code. Lucide is ISC-licensed (verify
 * current terms). When `labelled`, exposes the condition text to assistive tech.
 */
export function WeatherIcon({ code, isDay, size = 24, className, labelled = true }: WeatherIconProps) {
  const Icon = iconForCode(code, isDay)
  const label = describeCode(code)
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={1.75}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
    />
  )
}
