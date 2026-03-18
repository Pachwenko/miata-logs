import { useState } from 'react'
import { type ParsedPID } from '../parser/LogParser'
import './PidConfigPanel.css'

interface PidConfig {
  [pidId: number]: { name: string; unit: string }
}

interface PidConfigPanelProps {
  pids: ParsedPID[]
  pidConfigs: PidConfig
  onConfigChange: (pidId: number, name: string, unit: string) => void
}

export function PidConfigPanel({
  pids,
  pidConfigs,
  onConfigChange,
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
        <span>Configuration</span>
      </button>

      {isOpen && (
        <div className="config-content">
          <table className="config-table">
            <thead>
              <tr>
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
