import { useEffect, useRef, useState } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      hovertemplate: `<b>${displayName}</b><br>Time: %{x:.2f}s<br>Value: %{y:.2f} ${displayUnit}<extra></extra>`,
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

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="pid-chart-container">
      <div className="pid-chart-header">
        <button
          className="fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>
      <div ref={containerRef} className="pid-chart" />
      {!isFullscreen && <PidStats stats={stats} unit={displayUnit} />}
    </div>
  )
}
