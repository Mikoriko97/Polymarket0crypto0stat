import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCSV(rows: Record<string, unknown>[], filename = "data.csv") {
  if (!rows?.length) return
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v)
    const needs = /[",\n]/.test(s)
    return needs ? `"${s.replace(/"/g, '""')}` + '"' : s
  }
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(","))].join("\n")
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename)
}

export function exportToJSON(rows: unknown[], filename = "data.json") {
  const json = JSON.stringify(rows, null, 2)
  downloadBlob(new Blob([json], { type: "application/json" }), filename)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
