import { describe, it, expect } from 'vitest'
import { getPidName, getPidUnit, getAllKnownPIDs } from './pidLookup'

describe('pidLookup', () => {
  it('should return correct names for known PIDs', () => {
    expect(getPidName(4)).toBe('Engine Load')
    expect(getPidName(5)).toBe('Coolant Temp')
    expect(getPidName(12)).toBe('Engine RPM')
    expect(getPidName(13)).toBe('Vehicle Speed')
  })

  it('should return correct units for known PIDs', () => {
    expect(getPidUnit(4)).toBe('%')
    expect(getPidUnit(5)).toBe('°C')
    expect(getPidUnit(12)).toBe('rpm')
    expect(getPidUnit(13)).toBe('km/h')
  })

  it('should return fallback name for unknown PIDs', () => {
    expect(getPidName(999)).toBe('PID 999')
  })

  it('should return empty string unit for unknown PIDs', () => {
    expect(getPidUnit(999)).toBe('')
  })

  it('should list all known PIDs in order', () => {
    const pids = getAllKnownPIDs()
    expect(pids.length).toBeGreaterThan(0)
    expect(pids[0]).toBeLessThan(pids[1])
  })
})
