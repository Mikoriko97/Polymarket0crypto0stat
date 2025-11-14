export default function Footer() {
  return (
    <footer className="bg-background border-t border-secondary mt-16">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Left: Copyright */}
          <div className="text-sm text-muted-foreground">© 2025 Polymarket Analytics. All rights reserved.</div>

          {/* Right: Created by */}
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400"><a href="https://x.com/qazzaq_eth" target="_blank" rel="noopener noreferrer">Created for Polymarket by QAZZAQ</a></div>
        </div>
      </div>
    </footer>
  )
}
