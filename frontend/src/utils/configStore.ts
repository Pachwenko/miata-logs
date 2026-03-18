/**
 * Flexible localStorage-based configuration store for Miata Log Viewer
 * Persists: PID customizations, colors, visibility settings, and more
 */

export interface PidCustomization {
  name: string
  unit: string
  color?: string
}

export interface AppConfig {
  pidCustomizations: {
    [pidId: number]: PidCustomization
  }
  visiblePids: number[]
  showIndividualCharts: boolean
  expandedSections: {
    [sectionName: string]: boolean
  }
  version: number // For future migrations
}

const STORAGE_KEY = 'miatLogViewerConfig'
const CURRENT_VERSION = 1

const DEFAULT_CONFIG: AppConfig = {
  pidCustomizations: {},
  visiblePids: [],
  showIndividualCharts: false,
  expandedSections: {
    config: false,
    selector: true,
  },
  version: CURRENT_VERSION,
}

class ConfigStore {
  private config: AppConfig

  constructor() {
    this.config = this.load()
  }

  /**
   * Load config from localStorage, with fallback to defaults
   */
  private load(): AppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return DEFAULT_CONFIG

      const parsed = JSON.parse(stored) as AppConfig

      // Handle version migrations here if needed
      if (parsed.version !== CURRENT_VERSION) {
        console.warn('Config version mismatch, using defaults')
        return DEFAULT_CONFIG
      }

      return parsed
    } catch (error) {
      console.error('Failed to load config:', error)
      return DEFAULT_CONFIG
    }
  }

  /**
   * Save config to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  /**
   * Get all PID customizations
   */
  getPidCustomizations(): { [pidId: number]: PidCustomization } {
    return this.config.pidCustomizations
  }

  /**
   * Get customization for a single PID
   */
  getPidCustomization(pidId: number): PidCustomization | undefined {
    return this.config.pidCustomizations[pidId]
  }

  /**
   * Set customization for a PID
   */
  setPidCustomization(
    pidId: number,
    customization: Partial<PidCustomization>
  ): void {
    const existing = this.config.pidCustomizations[pidId] || {}
    this.config.pidCustomizations[pidId] = {
      ...existing,
      ...customization,
    }
    this.save()
  }

  /**
   * Set all PID customizations at once
   */
  setPidCustomizations(customizations: {
    [pidId: number]: PidCustomization
  }): void {
    this.config.pidCustomizations = customizations
    this.save()
  }

  /**
   * Get visible PIDs list
   */
  getVisiblePids(): number[] {
    return this.config.visiblePids
  }

  /**
   * Set visible PIDs
   */
  setVisiblePids(pidIds: number[]): void {
    this.config.visiblePids = pidIds
    this.save()
  }

  /**
   * Check if a PID is visible
   */
  isVisible(pidId: number): boolean {
    return this.config.visiblePids.includes(pidId)
  }

  /**
   * Add PID to visible list
   */
  showPid(pidId: number): void {
    if (!this.config.visiblePids.includes(pidId)) {
      this.config.visiblePids.push(pidId)
      this.save()
    }
  }

  /**
   * Remove PID from visible list
   */
  hidePid(pidId: number): void {
    this.config.visiblePids = this.config.visiblePids.filter(
      (id) => id !== pidId
    )
    this.save()
  }

  /**
   * Toggle PID visibility
   */
  togglePidVisibility(pidId: number): void {
    if (this.isVisible(pidId)) {
      this.hidePid(pidId)
    } else {
      this.showPid(pidId)
    }
  }

  /**
   * Get whether individual charts should be shown
   */
  getShowIndividualCharts(): boolean {
    return this.config.showIndividualCharts
  }

  /**
   * Set whether to show individual charts
   */
  setShowIndividualCharts(show: boolean): void {
    this.config.showIndividualCharts = show
    this.save()
  }

  /**
   * Get expanded state of a section (config panel, selector, etc)
   */
  isSectionExpanded(sectionName: string): boolean {
    return this.config.expandedSections[sectionName] ?? false
  }

  /**
   * Set expanded state of a section
   */
  setSectionExpanded(sectionName: string, expanded: boolean): void {
    this.config.expandedSections[sectionName] = expanded
    this.save()
  }

  /**
   * Toggle section expanded state
   */
  toggleSectionExpanded(sectionName: string): void {
    this.config.expandedSections[sectionName] = !this.isSectionExpanded(
      sectionName
    )
    this.save()
  }

  /**
   * Get the entire config (for debugging)
   */
  getConfig(): AppConfig {
    return { ...this.config }
  }

  /**
   * Reset all config to defaults
   */
  reset(): void {
    this.config = structuredClone(DEFAULT_CONFIG)
    this.save()
  }

  /**
   * Export config as JSON (for backup/sharing)
   */
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * Import config from JSON
   */
  import(json: string): boolean {
    try {
      const imported = JSON.parse(json) as AppConfig
      if (imported.version !== CURRENT_VERSION) {
        console.warn('Imported config version mismatch')
        return false
      }
      this.config = imported
      this.save()
      return true
    } catch (error) {
      console.error('Failed to import config:', error)
      return false
    }
  }
}

// Export singleton instance
export const configStore = new ConfigStore()
