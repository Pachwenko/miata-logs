import { useState, useEffect } from 'react'
import { parseVTLog, type ParsedLog } from './parser/LogParser'
import { FileUpload } from './components/FileUpload'
import { LogInfo } from './components/LogInfo'
import { PidConfigPanel } from './components/PidConfigPanel'
import { CombinedChart } from './components/CombinedChart'
import { ChannelViewer } from './components/ChannelViewer'
import { configStore } from './utils/configStore'
import './App.css'

function App() {
  const [log, setLog] = useState<ParsedLog | null>(null)
  const [visiblePids, setVisiblePids] = useState<Set<number>>(() => {
    return new Set(configStore.getVisiblePids())
  })
  const [pidConfigs, setPidConfigs] = useState(() => {
    const customizations = configStore.getPidCustomizations()
    return Object.fromEntries(
      Object.entries(customizations).map(([id, custom]) => [
        parseInt(id),
        { name: custom.name, unit: custom.unit },
      ])
    )
  })
  const [pidColors, setPidColors] = useState(() => {
    const customizations = configStore.getPidCustomizations()
    return Object.fromEntries(
      Object.entries(customizations)
        .filter(([, custom]) => custom.color)
        .map(([id, custom]) => [parseInt(id), custom.color!])
    )
  })
  const [error, setError] = useState<string | null>(null)

  // Sync state changes to configStore
  useEffect(() => {
    configStore.setVisiblePids(Array.from(visiblePids))
  }, [visiblePids])

  useEffect(() => {
    const customizations = Object.fromEntries(
      Object.entries(pidConfigs).map(([id, config]) => [
        parseInt(id),
        {
          name: config.name,
          unit: config.unit,
          color: pidColors[parseInt(id)],
        },
      ])
    )
    configStore.setPidCustomizations(customizations)
  }, [pidConfigs, pidColors])

  const handleFileSelect = (content: string) => {
    try {
      const parsed = parseVTLog(content)
      setLog(parsed)
      // Show all PIDs by default
      setVisiblePids(new Set(parsed.pids.map((p) => p.id)))
      setError(null)
    } catch (err) {
      setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLog(null)
    }
  }

  const handleTogglePid = (pidId: number) => {
    const newVisible = new Set(visiblePids)
    if (newVisible.has(pidId)) {
      newVisible.delete(pidId)
    } else {
      newVisible.add(pidId)
    }
    setVisiblePids(newVisible)
  }

  const handleConfigChange = (pidId: number, name: string, unit: string) => {
    setPidConfigs((prev) => ({
      ...prev,
      [pidId]: { name, unit },
    }))
  }

  const handleColorChange = (pidId: number, color: string) => {
    setPidColors((prev) => ({
      ...prev,
      [pidId]: color,
    }))
  }

  const handleReset = () => {
    setLog(null)
    setVisiblePids(new Set())
    setError(null)
  }

  if (!log) {
    return <FileUpload onFileSelect={handleFileSelect} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📊 Miata Log Viewer</h1>
        <button className="reset-btn" onClick={handleReset}>
          ← Load Different File
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="app-main">
        <LogInfo log={log} />
        <PidConfigPanel
          pids={log.pids}
          pidConfigs={pidConfigs}
          visiblePids={visiblePids}
          onConfigChange={handleConfigChange}
          onToggleVisibility={handleTogglePid}
        />

        {/* Derived config for all charts */}
        {(() => {
          const customNames = Object.fromEntries(
            Object.entries(pidConfigs).map(([id, config]) => [parseInt(id), config.name])
          )
          const customUnits = Object.fromEntries(
            Object.entries(pidConfigs).map(([id, config]) => [parseInt(id), config.unit])
          )

          return (
            <>
              {/* Combined Chart */}
              <CombinedChart
                pids={log.pids}
                visiblePids={visiblePids}
                initialColors={pidColors}
                onColorChange={handleColorChange}
                customNames={customNames}
                customUnits={customUnits}
              />

              {/* Individual Channels View - with mode selector */}
              <ChannelViewer
                pids={log.pids}
                visiblePids={visiblePids}
                pidConfigs={pidConfigs}
              />
            </>
          )
        })()}
      </main>
    </div>
  )
}

export default App
