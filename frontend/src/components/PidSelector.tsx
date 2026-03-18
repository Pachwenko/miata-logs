import { type ParsedPID } from '../parser/LogParser'
import './PidSelector.css'

interface PidSelectorProps {
  pids: ParsedPID[]
  visiblePids: Set<number>
  onToggle: (pidId: number) => void
}

export function PidSelector({ pids, visiblePids, onToggle }: PidSelectorProps) {
  return (
    <div className="pid-selector">
      <h3>Data Channels ({visiblePids.size} of {pids.length})</h3>
      <div className="pid-grid">
        {pids.map((pid) => (
          <label key={pid.id} className="pid-checkbox">
            <input
              type="checkbox"
              checked={visiblePids.has(pid.id)}
              onChange={() => onToggle(pid.id)}
            />
            <span className="pid-label">
              {pid.name}
              {pid.unit && <span className="unit"> ({pid.unit})</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
