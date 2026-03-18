import { describe, it, expect } from 'vitest'
import { parseVTLog } from './LogParser'

describe('LogParser', () => {
  const sampleVTLog = `<?xml version="1.0" encoding="utf-8"?>
<Datalog>
  <Version>1</Version>
  <Name>Test Log</Name>
  <Description>Test Description</Description>
  <RecordedOn>2026-03-17T12:00:00Z</RecordedOn>
  <Platform>G3_MAZDA_MX5_NC1</Platform>
  <VIN>JM1NC25F160103829</VIN>
  <Data>
    <PID ID="4">
      <Record Time="1.0" Value="10" />
      <Record Time="2.0" Value="20" />
      <Record Time="3.0" Value="30" />
    </PID>
    <PID ID="5">
      <Record Time="1.0" Value="85" />
      <Record Time="2.0" Value="90" />
    </PID>
  </Data>
</Datalog>`

  it('should parse valid VTLog XML', () => {
    const log = parseVTLog(sampleVTLog)
    expect(log).toBeDefined()
    expect(log.name).toBe('Test Log')
    expect(log.platform).toBe('G3_MAZDA_MX5_NC1')
    expect(log.vin).toBe('JM1NC25F160103829')
  })

  it('should extract all PIDs', () => {
    const log = parseVTLog(sampleVTLog)
    expect(log.pids).toHaveLength(2)
    expect(log.pids[0].id).toBe(4)
    expect(log.pids[1].id).toBe(5)
  })

  it('should parse PID records correctly', () => {
    const log = parseVTLog(sampleVTLog)
    const pid4 = log.pids[0]

    expect(pid4.records).toHaveLength(3)
    expect(pid4.records[0]).toEqual({ time: 1.0, value: 10 })
    expect(pid4.records[2]).toEqual({ time: 3.0, value: 30 })
  })

  it('should assign PID names and units', () => {
    const log = parseVTLog(sampleVTLog)

    expect(log.pids[0].name).toBe('Engine Load')
    expect(log.pids[0].unit).toBe('%')

    expect(log.pids[1].name).toBe('Coolant Temp')
    expect(log.pids[1].unit).toBe('°C')
  })

  it('should throw on invalid XML', () => {
    expect(() => parseVTLog('not xml')).toThrow()
  })

  it('should handle missing Data section', () => {
    const invalidLog = `<?xml version="1.0"?>
<Datalog>
  <Version>1</Version>
  <Name>Bad Log</Name>
</Datalog>`

    expect(() => parseVTLog(invalidLog)).toThrow()
  })
})
