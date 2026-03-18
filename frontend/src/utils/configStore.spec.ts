import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configStore } from './configStore'

describe('configStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    configStore.reset()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('PID Customizations', () => {
    it('should set and get PID customization', () => {
      configStore.setPidCustomization(4, {
        name: 'Custom Load',
        unit: '%',
      })

      const custom = configStore.getPidCustomization(4)
      expect(custom?.name).toBe('Custom Load')
      expect(custom?.unit).toBe('%')
    })

    it('should persist customizations to localStorage', () => {
      configStore.setPidCustomization(5, {
        name: 'Custom Temp',
        unit: 'C',
      })

      const stored = localStorage.getItem('miatLogViewerConfig')
      expect(stored).toBeDefined()

      const config = JSON.parse(stored!)
      expect(config.pidCustomizations[5].name).toBe('Custom Temp')
    })
  })

  describe('Visible PIDs', () => {
    it('should manage visible PID list', () => {
      configStore.setVisiblePids([4, 5, 12])

      expect(configStore.getVisiblePids()).toEqual([4, 5, 12])
      expect(configStore.isVisible(4)).toBe(true)
      expect(configStore.isVisible(99)).toBe(false)
    })

    it('should toggle PID visibility', () => {
      configStore.setVisiblePids([4])

      configStore.togglePidVisibility(4)
      expect(configStore.isVisible(4)).toBe(false)

      configStore.togglePidVisibility(4)
      expect(configStore.isVisible(4)).toBe(true)
    })

    it('should add and remove PIDs', () => {
      configStore.showPid(4)
      expect(configStore.isVisible(4)).toBe(true)

      configStore.hidePid(4)
      expect(configStore.isVisible(4)).toBe(false)
    })
  })

  describe('Section Expansion State', () => {
    it('should manage section expanded state', () => {
      configStore.setSectionExpanded('config', true)
      expect(configStore.isSectionExpanded('config')).toBe(true)

      configStore.setSectionExpanded('config', false)
      expect(configStore.isSectionExpanded('config')).toBe(false)
    })

    it('should toggle section expansion', () => {
      configStore.setSectionExpanded('selector', false)
      configStore.toggleSectionExpanded('selector')

      expect(configStore.isSectionExpanded('selector')).toBe(true)
    })
  })

  describe('Individual Charts Toggle', () => {
    it('should manage individual charts visibility', () => {
      configStore.setShowIndividualCharts(true)
      expect(configStore.getShowIndividualCharts()).toBe(true)

      configStore.setShowIndividualCharts(false)
      expect(configStore.getShowIndividualCharts()).toBe(false)
    })
  })

  describe('Config Import/Export', () => {
    it('should export config as JSON', () => {
      configStore.setPidCustomization(4, {
        name: 'Test',
        unit: '%',
      })

      const json = configStore.export()
      expect(json).toContain('pidCustomizations')
      expect(json).toContain('Test')
    })

    it('should import config from JSON', () => {
      // Set initial config
      configStore.setPidCustomization(4, {
        name: 'TestValue',
        unit: '%',
      })
      const originalConfig = configStore.export()

      // Reset and verify it's empty
      configStore.reset()
      expect(configStore.getPidCustomization(4)).toBeUndefined()

      // Import and verify
      const success = configStore.import(originalConfig)
      expect(success).toBe(true)
      expect(configStore.getPidCustomization(4)?.name).toBe('TestValue')
    })

    it('should reject invalid JSON import', () => {
      const success = configStore.import('not valid json')
      expect(success).toBe(false)
    })
  })

  describe('Reset', () => {
    it('should reset to defaults', () => {
      configStore.setPidCustomization(4, {
        name: 'Custom',
        unit: '%',
      })
      configStore.setVisiblePids([4, 5])

      configStore.reset()

      expect(configStore.getPidCustomization(4)).toBeUndefined()
      expect(configStore.getVisiblePids()).toEqual([])
    })
  })
})
