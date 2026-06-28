import { Suspense, lazy, useEffect } from 'react'
import { Header } from './components/Header'
import { CurrentConditions } from './components/CurrentConditions'
import { HourlyForecast } from './components/HourlyForecast'
import { DailyForecast } from './components/DailyForecast'
import { AirQualityCard } from './components/AirQualityCard'
import { SunMoonCard } from './components/SunMoonCard'
import { InsightsCard } from './components/InsightsCard'
import { CardSkeleton } from './components/ui/Skeleton'
import { ErrorCard } from './components/ui/Message'
import { useAirQuality, useForecast } from './hooks/useWeather'
import { usePersistentState } from './hooks/usePersistentState'
import { applyTheme, computeTheme, type ThemeMode } from './lib/theme'
import { getCodeInfo } from './lib/weatherCodes'
import type { GeoLocation, UnitPrefs } from './types/weather'

// Leaflet + its CSS are heavy; load the radar only when the dashboard renders.
const RadarMap = lazy(() =>
  import('./components/RadarMap').then((m) => ({ default: m.RadarMap })),
)

const DEFAULT_LOCATION: GeoLocation = {
  id: 2643743,
  name: 'London',
  latitude: 51.5072,
  longitude: -0.1276,
  country: 'United Kingdom',
  countryCode: 'GB',
  admin1: 'England',
}

const DEFAULT_PREFS: UnitPrefs = { temperature: 'celsius', wind: 'kmh', time: '24h' }

export default function App() {
  const [prefs, setPrefs] = usePersistentState<UnitPrefs>('skyline.prefs', DEFAULT_PREFS)
  const [themeMode, setThemeMode] = usePersistentState<ThemeMode>('skyline.theme', 'auto')
  const [location, setLocation] = usePersistentState<GeoLocation>('skyline.location', DEFAULT_LOCATION)
  const [favorites, setFavorites] = usePersistentState<GeoLocation[]>('skyline.favorites', [])

  const forecast = useForecast(location, prefs)
  const airQuality = useAirQuality(location)

  // Adaptive theming: retint from the live condition + day/night, else a default.
  useEffect(() => {
    const current = forecast.data?.current
    if (current) {
      const { kind } = getCodeInfo(current.weather_code)
      applyTheme(computeTheme(kind, current.is_day === 1, themeMode))
    } else {
      applyTheme(computeTheme('clear', themeMode !== 'dark', themeMode))
    }
  }, [forecast.data, themeMode])

  const isFavorite = favorites.some((f) => f.id === location.id)

  function toggleFavorite(loc: GeoLocation) {
    setFavorites((prev) =>
      prev.some((f) => f.id === loc.id) ? prev.filter((f) => f.id !== loc.id) : [...prev, loc],
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <Header
        prefs={prefs}
        onPrefsChange={setPrefs}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        location={location}
        favorites={favorites}
        onSelectLocation={setLocation}
        onToggleFavorite={toggleFavorite}
      />

      <main className="flex-1">
        {forecast.isError ? (
          <ErrorCard
            title="Couldn't load the forecast"
            message={(forecast.error as Error)?.message ?? 'Please try again.'}
            onRetry={() => forecast.refetch()}
          />
        ) : forecast.isLoading || !forecast.data ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Hero spans two columns on wide screens */}
            <div className="md:col-span-2">
              <CurrentConditions
                forecast={forecast.data}
                location={location}
                prefs={prefs}
                isFavorite={isFavorite}
                onToggleFavorite={() => toggleFavorite(location)}
              />
            </div>

            <InsightsCard forecast={forecast.data} prefs={prefs} delay={0.05} />

            <HourlyForecast forecast={forecast.data} prefs={prefs} delay={0.1} />

            <DailyForecast forecast={forecast.data} prefs={prefs} delay={0.15} />

            {airQuality.isSuccess ? (
              <AirQualityCard data={airQuality.data} delay={0.2} />
            ) : airQuality.isError ? (
              <ErrorCard title="Air quality unavailable" message="Couldn't load AQI data." />
            ) : (
              <CardSkeleton lines={4} />
            )}

            <SunMoonCard forecast={forecast.data} prefs={prefs} delay={0.25} />

            <Suspense fallback={<div className="card col-span-full h-96 animate-pulse" />}>
              <RadarMap location={location} />
            </Suspense>
          </div>
        )}
      </main>

      <footer className="border-t border-border pt-4 text-center text-xs text-muted">
        Weather &amp; air-quality data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">
          Open-Meteo
        </a>{' '}
        (CC BY 4.0). Built with React, Vite &amp; Tailwind. Icons by Lucide.
      </footer>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2">
        <CardSkeleton lines={5} />
      </div>
      <CardSkeleton lines={4} />
      <div className="col-span-full">
        <CardSkeleton lines={6} />
      </div>
      <CardSkeleton lines={6} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={4} />
    </div>
  )
}
