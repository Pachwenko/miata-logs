import { type ParsedLog } from '../parser/LogParser'
import './LogInfo.css'

interface LogInfoProps {
  log: ParsedLog
}

export function LogInfo({ log }: LogInfoProps) {
  const date = new Date(log.recordedOn)
  const dateStr = date.toLocaleString()

  return (
    <div className="log-info">
      <div className="info-row">
        <span className="label">Log Name:</span>
        <span className="value">{log.name}</span>
      </div>
      <div className="info-row">
        <span className="label">Platform:</span>
        <span className="value">{log.platform}</span>
      </div>
      <div className="info-row">
        <span className="label">VIN:</span>
        <span className="value">{log.vin}</span>
      </div>
      <div className="info-row">
        <span className="label">Recorded:</span>
        <span className="value">{dateStr}</span>
      </div>
      <div className="info-row">
        <span className="label">Total PIDs:</span>
        <span className="value">{log.pids.length}</span>
      </div>
    </div>
  )
}
