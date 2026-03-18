import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js/dist/plotly.js'
import { type ParsedPID } from '../parser/LogParser'
import { normalizeValue, getMinMax, randomColor } from '../utils/normalize'
import './CombinedChart.css'

interface PidColorConfig {
  [pidId: number]: string
}

interface CombinedChartProps {
  pids: ParsedPID[]
  visiblePids: Set<number>
  customNames?: { [pidId: number]: string }
  customUnits?: { [pidId: number]: string }
  initialColors?: { [pidId: number]: string }
  onColorChange?: (pidId: number, color: string) => void
}

export function CombinedChart({
  pids,
  visiblePids,
  customNames,
  customUnits: _customUnits,
  initialColors,
  onColorChange,
}: CombinedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [colors, setColors] = useState<PidColorConfig>(() => {
    const initColors: PidColorConfig = {}
    pids.forEach((pid) => {
      initColors[pid.id] = initialColors?.[pid.id] || randomColor()
    })
    return initColors
  })
  const [showConfig, setShowConfig] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const visiblePidsArray = pids.filter((p) => visiblePids.has(p.id))

  useEffect(() => {
    if (!containerRef.current || visiblePidsArray.length === 0) return

    const traces = visiblePidsArray.map((pid) => {
      const times = pid.records.map((r) => r.time)
      const values = pid.records.map((r) => r.value)
      const { min, max } = getMinMax(values)
      const normalized = values.map((v) => normalizeValue(v, min, max))

      const displayName = customNames?.[pid.id] || pid.name
      const displayUnit = pid.unit

      return {
        x: times,
        y: normalized,
        customdata: values,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: displayName,
        line: {
          color: colors[pid.id],
          width: 2,
        },
        hovertemplate: `<b>${displayName}</b><br>Time: %{x:.2f}s<br>Normalized: %{y:.1f}%<br>Value: %{customdata:.2f} ${displayUnit}<extra></extra>`,
      }
    })

    const layout = {
      title: {
        text: 'Combined View (Normalized 0-100%)',
        font: { size: 16 },
      },
      xaxis: {
        title: 'Time (s)',
        gridcolor: 'rgba(128, 128, 128, 0.2)',
      },
      yaxis: {
        title: 'Normalized Value (%)',
        gridcolor: 'rgba(128, 128, 128, 0.2)',
        range: [0, 100],
      },
      plot_bgcolor: 'rgba(40, 40, 40, 1)',
      paper_bgcolor: 'rgba(30, 30, 30, 1)',
      font: { color: 'rgba(200, 200, 200, 1)' },
      margin: { l: 60, r: 20, t: 60, b: 40 },
      hovermode: 'x unified' as const,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(30, 30, 30, 0.8)',
        bordercolor: 'rgba(128, 128, 128, 0.5)',
        borderwidth: 1,
      },
    }

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    }

    Plotly.newPlot(containerRef.current, traces, layout, config)

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current)
      }
    }
  }, [visiblePidsArray, colors, customNames])

  const handleColorChange = (pidId: number, newColor: string) => {
    setColors((prev) => ({ ...prev, [pidId]: newColor }))
    onColorChange?.(pidId, newColor)
  }

  const toggleFullscreen = async () => {
    const element = document.querySelector('.combined-chart-section')
    if (!element) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await element.requestFullscreen()
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
    <div className="combined-chart-section">
      <div className="combined-header">
        <h3>Combined View</h3>
        <div className="combined-header-buttons">
          <button
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            ⛶
          </button>
          <button
            className="color-config-toggle"
            onClick={() => setShowConfig(!showConfig)}
            title="Toggle color configuration"
          >
            🎨 Colors
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="color-config">
          <div className="color-config-grid">
            {visiblePidsArray.map((pid) => (
              <div key={pid.id} className="color-config-item">
                <label>
                  <span className="config-label">
                    {customNames?.[pid.id] || pid.name}
                  </span>
                  <input
                    type="color"
                    value={colors[pid.id]}
                    onChange={(e) => handleColorChange(pid.id, e.target.value)}
                    className="color-picker"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={containerRef} className="combined-chart" />
    </div>
  )
}
