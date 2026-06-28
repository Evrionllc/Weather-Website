import { Moon, Sun, SunMoon } from 'lucide-react'
import type { GeoLocation, UnitPrefs } from '../types/weather'
import type { ThemeMode } from '../lib/theme'
import { LocationSearch } from './LocationSearch'
import { SegmentedControl } from './ui/SegmentedControl'

interface HeaderProps {
  prefs: UnitPrefs
  onPrefsChange: (prefs: UnitPrefs) => void
  themeMode: ThemeMode
  onThemeChange: (mode: ThemeMode) => void
  location: GeoLocation | null
  favorites: GeoLocation[]
  onSelectLocation: (loc: GeoLocation) => void
  onToggleFavorite: (loc: GeoLocation) => void
}

const THEME_ICON: Record<ThemeMode, typeof Sun> = {
  auto: SunMoon,
  light: Sun,
  dark: Moon,
}

const THEME_ORDER: ThemeMode[] = ['auto', 'light', 'dark']

export function Header({
  prefs,
  onPrefsChange,
  themeMode,
  onThemeChange,
  location,
  favorites,
  onSelectLocation,
  onToggleFavorite,
}: HeaderProps) {
  const ThemeIcon = THEME_ICON[themeMode]

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length]
    onThemeChange(next)
  }

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <img src="/favicon.svg" alt="" width={32} height={32} className="rounded-lg" />
        <span className="text-lg font-semibold tracking-tight text-fg">Skyline</span>
      </div>

      <LocationSearch
        active={location}
        favorites={favorites}
        onSelect={onSelectLocation}
        onToggleFavorite={onToggleFavorite}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          ariaLabel="Temperature units"
          value={prefs.temperature}
          onChange={(temperature) =>
            onPrefsChange({
              ...prefs,
              temperature,
              // Keep wind units aligned with the metric/imperial choice.
              wind: temperature === 'fahrenheit' ? 'mph' : 'kmh',
            })
          }
          options={[
            { value: 'celsius', label: '°C' },
            { value: 'fahrenheit', label: '°F' },
          ]}
        />
        <SegmentedControl
          ariaLabel="Time format"
          value={prefs.time}
          onChange={(time) => onPrefsChange({ ...prefs, time })}
          options={[
            { value: '24h', label: '24h' },
            { value: '12h', label: '12h' },
          ]}
        />
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={`Theme: ${themeMode}. Click to change.`}
          title={`Theme: ${themeMode}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg hover:bg-surface-2"
        >
          <ThemeIcon size={17} />
        </button>
      </div>
    </header>
  )
}
