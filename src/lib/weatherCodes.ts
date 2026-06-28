import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'

/** Broad sky category derived from a WMO code — drives both icons and theming. */
export type SkyKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'

interface CodeInfo {
  label: string
  kind: SkyKind
}

/** WMO Weather interpretation codes (WW) used by Open-Meteo. */
const CODE_MAP: Record<number, CodeInfo> = {
  0: { label: 'Clear sky', kind: 'clear' },
  1: { label: 'Mainly clear', kind: 'partly' },
  2: { label: 'Partly cloudy', kind: 'partly' },
  3: { label: 'Overcast', kind: 'cloudy' },
  45: { label: 'Fog', kind: 'fog' },
  48: { label: 'Rime fog', kind: 'fog' },
  51: { label: 'Light drizzle', kind: 'drizzle' },
  53: { label: 'Drizzle', kind: 'drizzle' },
  55: { label: 'Dense drizzle', kind: 'drizzle' },
  56: { label: 'Freezing drizzle', kind: 'drizzle' },
  57: { label: 'Freezing drizzle', kind: 'drizzle' },
  61: { label: 'Light rain', kind: 'rain' },
  63: { label: 'Rain', kind: 'rain' },
  65: { label: 'Heavy rain', kind: 'rain' },
  66: { label: 'Freezing rain', kind: 'rain' },
  67: { label: 'Freezing rain', kind: 'rain' },
  71: { label: 'Light snow', kind: 'snow' },
  73: { label: 'Snow', kind: 'snow' },
  75: { label: 'Heavy snow', kind: 'snow' },
  77: { label: 'Snow grains', kind: 'snow' },
  80: { label: 'Light showers', kind: 'rain' },
  81: { label: 'Showers', kind: 'rain' },
  82: { label: 'Violent showers', kind: 'rain' },
  85: { label: 'Snow showers', kind: 'snow' },
  86: { label: 'Heavy snow showers', kind: 'snow' },
  95: { label: 'Thunderstorm', kind: 'thunder' },
  96: { label: 'Thunderstorm, hail', kind: 'thunder' },
  99: { label: 'Thunderstorm, heavy hail', kind: 'thunder' },
}

const FALLBACK: CodeInfo = { label: 'Unknown', kind: 'cloudy' }

export function getCodeInfo(code: number): CodeInfo {
  return CODE_MAP[code] ?? FALLBACK
}

export function describeCode(code: number): string {
  return getCodeInfo(code).label
}

/** Pick a Lucide icon for a code, choosing day/night variants where it matters. */
export function iconForCode(code: number, isDay: boolean): LucideIcon {
  const { kind } = getCodeInfo(code)
  switch (kind) {
    case 'clear':
      return isDay ? Sun : Moon
    case 'partly':
      return isDay ? CloudSun : CloudMoon
    case 'cloudy':
      return Cloudy
    case 'fog':
      return CloudFog
    case 'drizzle':
      return CloudDrizzle
    case 'rain':
      return CloudRain
    case 'snow':
      return CloudSnow
    case 'thunder':
      return code >= 96 ? CloudHail : CloudLightning
    default:
      return Cloud
  }
}
