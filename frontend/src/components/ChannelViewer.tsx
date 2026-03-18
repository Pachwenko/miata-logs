import { useState } from 'react'
import type { ParsedPID } from '../parser/LogParser'
import { PidChart } from './PidChart'
import { calculateStats } from '../utils/stats'
import { configStore } from '../utils/configStore'
import './ChannelViewer.css'

type ViewMode = 'graphs' | 'table' | 'stats'

interface ChannelViewerProps {
  pids: ParsedPID[]
  visiblePids: Set<number>
  pidConfigs: { [id: number]: { name: string; unit: string } }
}

export function ChannelViewer({ pids, visiblePids, pidConfigs }: ChannelViewerProps) {
  const [isOpen, setIsOpen] = useState(() => configStore.getShowIndividualCharts())
  const [viewMode, setViewMode] = useState<ViewMode>('graphs')

  const visiblePidsArray = pids.filter((p) => visiblePids.has(p.id))

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const renderGraphsView = () => (
    <div className="graphs-grid">
      {visiblePidsArray.map((pid) => (
        <PidChart
          key={pid.id}
          pid={pid}
          customName={pidConfigs[pid.id]?.name}
          customUnit={pidConfigs[pid.id]?.unit}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="table-view">
      {visiblePidsArray.map((pid) => (
        <div key={pid.id} className="pid-table-wrapper">
          <h4>{pidConfigs[pid.id]?.name || pid.name} ({pidConfigs[pid.id]?.unit || pid.unit})</h4>
          <table className="pid-data-table">
            <thead>
              <tr>
                <th>Time (s)</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {pid.records.map((record, idx) => (
                <tr key={idx}>
                  <td className="time-cell">{record.time.toFixed(2)}</td>
                  <td className="value-cell">{record.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )

  const renderStatsView = () => (
    <div className="stats-grid">
      {visiblePidsArray.map((pid) => {
        const stats = calculateStats(pid.records.map((r) => r.value))
        const displayName = pidConfigs[pid.id]?.name || pid.name
        const displayUnit = pidConfigs[pid.id]?.unit || pid.unit

        return (
          <div key={pid.id} className="stat-card">
            <h4>{displayName}</h4>
            <div className="stat-values">
              <div className="stat-item">
                <span className="stat-label">Min</span>
                <span className="stat-value">
                  {stats.min.toFixed(2)} {displayUnit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max</span>
                <span className="stat-value">
                  {stats.max.toFixed(2)} {displayUnit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg</span>
                <span className="stat-value">
                  {stats.avg.toFixed(2)} {displayUnit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current</span>
                <span className="stat-value">
                  {stats.current.toFixed(2)} {displayUnit}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="channel-viewer">
      <button
        className="channel-viewer-toggle"
        onClick={() => {
          setIsOpen(!isOpen)
          configStore.setShowIndividualCharts(!isOpen)
        }}
        aria-expanded={isOpen}
      >
        <span className="toggle-arrow">{isOpen ? '▼' : '▶'}</span>
        <span>Individual Channels</span>
      </button>

      {isOpen && (
        <div className="channel-viewer-content">
          <div className="view-mode-selector">
            <button
              className={`mode-btn ${viewMode === 'graphs' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('graphs')}
            >
              📊 Graphs
            </button>
            <button
              className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('table')}
            >
              📋 Table
            </button>
            <button
              className={`mode-btn ${viewMode === 'stats' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('stats')}
            >
              📈 Stats
            </button>
          </div>

          {viewMode === 'graphs' && renderGraphsView()}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'stats' && renderStatsView()}
        </div>
      )}
    </div>
  )
}
