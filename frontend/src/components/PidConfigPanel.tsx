import { useState } from 'react'
import { type ParsedPID } from '../parser/LogParser'
import './PidConfigPanel.css'

interface PidConfig {
  [pidId: number]: { name: string; unit: string }
}

interface PidConfigPanelProps {
  pids: ParsedPID[]
  pidConfigs: PidConfig
  visiblePids: Set<number>
  onConfigChange: (pidId: number, name: string, unit: string) => void
  onToggleVisibility: (pidId: number) => void
}

export function PidConfigPanel({
  pids,
  pidConfigs,
  visiblePids,
  onConfigChange,
  onToggleVisibility,
}: PidConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="pid-config-panel">
      <button
        className="config-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="toggle-arrow">
          {isOpen ? '▼' : '▶'}
        </span>
        <span>Configuration ({visiblePids.size} of {pids.length})</span>
      </button>

      {isOpen && (
        <div className="config-content">
          <table className="config-table">
            <thead>
              <tr>
                <th className="checkbox-col"></th>
                <th>PID ID</th>
                <th>Name</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {pids.map((pid) => {
                const config = pidConfigs[pid.id]
                return (
                  <tr key={pid.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={visiblePids.has(pid.id)}
                        onChange={() => onToggleVisibility(pid.id)}
                      />
                    </td>
                    <td className="pid-id-cell">{pid.id}</td>
                    <td>
                      <input
                        type="text"
                        value={config?.name ?? pid.name}
                        onChange={(e) =>
                          onConfigChange(
                            pid.id,
                            e.target.value,
                            config?.unit ?? pid.unit
                          )
                        }
                        placeholder={pid.name}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={config?.unit ?? pid.unit}
                        onChange={(e) =>
                          onConfigChange(
                            pid.id,
                            config?.name ?? pid.name,
                            e.target.value
                          )
                        }
                        placeholder={pid.unit}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
