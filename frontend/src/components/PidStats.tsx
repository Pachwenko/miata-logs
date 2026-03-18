import { type PIDStats } from '../utils/stats'
import './PidStats.css'

interface PidStatsProps {
  stats: PIDStats
  unit: string
}

export function PidStats({ stats, unit }: PidStatsProps) {
  return (
    <div className="pid-stats">
      <div className="stat-item">
        <span className="stat-label">Min</span>
        <span className="stat-value">
          {stats.min}
          {unit && <span className="stat-unit">{unit}</span>}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Max</span>
        <span className="stat-value">
          {stats.max}
          {unit && <span className="stat-unit">{unit}</span>}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Avg</span>
        <span className="stat-value">
          {stats.avg}
          {unit && <span className="stat-unit">{unit}</span>}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Current</span>
        <span className="stat-value">
          {stats.current}
          {unit && <span className="stat-unit">{unit}</span>}
        </span>
      </div>
    </div>
  )
}
