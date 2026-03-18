import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js/dist/plotly.js'
import { type ParsedPID } from '../parser/LogParser'
import { calculateStats } from '../utils/stats'
import { PidStats } from './PidStats'
import './PidChart.css'

interface PidChartProps {
  pid: ParsedPID
  customName?: string
  customUnit?: string
}

export function PidChart({ pid, customName, customUnit }: PidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = customName || pid.name
  const displayUnit = customUnit !== undefined ? customUnit : pid.unit

  useEffect(() => {
    if (!containerRef.current) return

    const times = pid.records.map((r) => r.time)
    const values = pid.records.map((r) => r.value)

    const trace = {
      x: times,
      y: values,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: displayName,
      line: {
        color: 'rgba(100, 150, 255, 1)',
        width: 2,
      },
    }

    const layout = {
      title: {
        text: `${displayName} ${displayUnit ? `(${displayUnit})` : ''}`,
        font: { size: 14 },
      },
      xaxis: {
        title: 'Time (s)',
        gridcolor: 'rgba(128, 128, 128, 0.2)',
      },
      yaxis: {
        title: displayUnit || 'Value',
        gridcolor: 'rgba(128, 128, 128, 0.2)',
      },
      plot_bgcolor: 'rgba(40, 40, 40, 1)',
      paper_bgcolor: 'rgba(30, 30, 30, 1)',
      font: { color: 'rgba(200, 200, 200, 1)' },
      margin: { l: 60, r: 20, t: 40, b: 40 },
    }

    const config = {
      responsive: true,
      displayModeBar: false,
    }

    Plotly.newPlot(containerRef.current, [trace], layout, config)

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current)
      }
    }
  }, [pid, displayName, displayUnit])

  const values = pid.records.map((r) => r.value)
  const stats = calculateStats(values)

  return (
    <div className="pid-chart-container">
      <div ref={containerRef} className="pid-chart" />
      <PidStats stats={stats} unit={displayUnit} />
    </div>
  )
}
