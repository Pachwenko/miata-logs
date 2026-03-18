export interface PIDStats {
  min: number
  max: number
  avg: number
  current: number
}

export function calculateStats(values: number[]): PIDStats {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0 }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const current = values[values.length - 1]

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    current: Math.round(current * 100) / 100,
  }
}
