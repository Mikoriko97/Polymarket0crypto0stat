"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <button onClick={onClick} className={cn("neumorphic px-3 py-2 rounded-lg", className)}>
      {copied ? "Copied" : "Copy Link"}
    </button>
  )
}

