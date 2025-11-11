"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const onThemeToggle = () => setTheme(isDark ? "light" : "dark")
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-surface/95">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 neumorphic flex items-center justify-center">
            <span className="text-xl font-bold">◆</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PolyMarket Analytics</h1>
            <p className="text-sm text-text-secondary">Crypto Prediction Markets</p>
          </div>
        </div>
        <button
          onClick={onThemeToggle}
          className="w-12 h-12 neumorphic flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Toggle theme"
        >
          {mounted ? (isDark ? "☀️" : "🌙") : null}
        </button>
      </div>
    </header>
  )
}
