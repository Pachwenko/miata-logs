export function normalizeValue(
  value: number,
  minVal: number,
  maxVal: number
): number {
  if (minVal === maxVal) return 50 // Default to middle if no range
  return ((value - minVal) / (maxVal - minVal)) * 100
}

export function getMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 100 }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

export function randomColor(): string {
  const hue = Math.random() * 360
  const saturation = 70 + Math.random() * 20
  const lightness = 50 + Math.random() * 10
  return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`
}
