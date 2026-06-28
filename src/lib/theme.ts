import type { SkyKind } from './weatherCodes'

/** User theme preference. "auto" follows the location's day/night. */
export type ThemeMode = 'auto' | 'light' | 'dark'

export interface Palette {
  bg: string
  bg2: string
  surface: string
  surface2: string
  border: string
  fg: string
  muted: string
  accent: string
  accentSoft: string
}

/** Background + accent per sky condition, for dark and light bases. */
const TINTS: Record<SkyKind, { darkDay: Tint; darkNight: Tint; light: Tint }> = {
  clear: t('#0a1830', '#16386c', '#5aa2ff', '#0a1020', '#131c30', '#6ea8fe', '#eef5ff', '#cfe2ff', '#2f6fd6'),
  partly: t('#0c1a2e', '#1b3450', '#6fb3ff', '#0b1220', '#151f33', '#7aa6e6', '#eef4fb', '#d4e3f5', '#2f74c8'),
  cloudy: t('#0e141c', '#222c38', '#93a4bd', '#0e141c', '#1d2733', '#8b97a8', '#eef1f5', '#d8dee7', '#5a6b85'),
  fog: t('#12161b', '#2a3138', '#b4bcc6', '#101418', '#252b32', '#9aa3ad', '#f0f2f4', '#dde1e6', '#6b7785'),
  drizzle: t('#0b141d', '#1a2a3a', '#74b9d8', '#0a121b', '#172534', '#6aa6c4', '#eaf2f7', '#d2e2ec', '#2d7fa6'),
  rain: t('#0a1018', '#14202e', '#5ea0d8', '#090f16', '#111c28', '#5694c8', '#e8eef5', '#cfdcea', '#2a6fa6'),
  snow: t('#0e141c', '#243244', '#bcd6f0', '#0d131b', '#1f2c3c', '#a9c4de', '#eef3f9', '#dbe7f4', '#4a78a8'),
  thunder: t('#0c0a18', '#221a3a', '#a78bfa', '#0a0814', '#1d1633', '#9a82e6', '#efecf7', '#ddd5ee', '#6d4fcf'),
}

interface Tint {
  bg: string
  bg2: string
  accent: string
}

function t(
  ddBg: string,
  ddBg2: string,
  ddAccent: string,
  dnBg: string,
  dnBg2: string,
  dnAccent: string,
  lBg: string,
  lBg2: string,
  lAccent: string,
) {
  return {
    darkDay: { bg: ddBg, bg2: ddBg2, accent: ddAccent },
    darkNight: { bg: dnBg, bg2: dnBg2, accent: dnAccent },
    light: { bg: lBg, bg2: lBg2, accent: lAccent },
  }
}

export function resolveDark(mode: ThemeMode, isDay: boolean): boolean {
  if (mode === 'light') return false
  if (mode === 'dark') return true
  return !isDay
}

export function computeTheme(kind: SkyKind, isDay: boolean, mode: ThemeMode): Palette {
  const dark = resolveDark(mode, isDay)
  const set = TINTS[kind]
  const tint = dark ? (isDay ? set.darkDay : set.darkNight) : set.light

  if (dark) {
    return {
      bg: tint.bg,
      bg2: tint.bg2,
      surface: 'rgba(255,255,255,0.05)',
      surface2: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.10)',
      fg: '#f5f7fa',
      muted: '#9aa6bd',
      accent: tint.accent,
      accentSoft: hexToRgba(tint.accent, 0.16),
    }
  }
  return {
    bg: tint.bg,
    bg2: tint.bg2,
    surface: 'rgba(255,255,255,0.65)',
    surface2: 'rgba(255,255,255,0.85)',
    border: 'rgba(15,23,42,0.10)',
    fg: '#0f1b2d',
    muted: '#5b6b85',
    accent: tint.accent,
    accentSoft: hexToRgba(tint.accent, 0.14),
  }
}

/** Write a palette to the document root so all --app-* consumers update at once. */
export function applyTheme(palette: Palette): void {
  const root = document.documentElement
  root.style.setProperty('--app-bg', palette.bg)
  root.style.setProperty('--app-bg-2', palette.bg2)
  root.style.setProperty('--app-surface', palette.surface)
  root.style.setProperty('--app-surface-2', palette.surface2)
  root.style.setProperty('--app-border', palette.border)
  root.style.setProperty('--app-fg', palette.fg)
  root.style.setProperty('--app-muted', palette.muted)
  root.style.setProperty('--app-accent', palette.accent)
  root.style.setProperty('--app-accent-soft', palette.accentSoft)
  root.style.colorScheme = palette.fg === '#f5f7fa' ? 'dark' : 'light'
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
