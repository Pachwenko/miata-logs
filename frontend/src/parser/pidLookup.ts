interface PIDInfo {
  name: string
  unit: string
}

const PID_MAP: Record<number, PIDInfo> = {
  4: { name: 'Engine Load', unit: '%' },
  5: { name: 'Coolant Temp', unit: '°C' },
  12: { name: 'Engine RPM', unit: 'rpm' },
  13: { name: 'Vehicle Speed', unit: 'km/h' },
  18: { name: 'Secondary Air Status', unit: '-' },
  20: { name: 'O2 Sensor B1S1', unit: 'V' },
  21: { name: 'O2 Sensor B1S2', unit: 'V' },
  22: { name: 'ST Fuel Trim B2', unit: '%' },
  23: { name: 'LT Fuel Trim B2', unit: '%' },
  24: { name: 'O2 Sensor B2S1', unit: 'V' },
  26: { name: 'O2 Sensor B2S3', unit: 'V' },
}

export function getPidName(pidId: number): string {
  return PID_MAP[pidId]?.name ?? `PID ${pidId}`
}

export function getPidUnit(pidId: number): string {
  return PID_MAP[pidId]?.unit ?? ''
}

export function getAllKnownPIDs(): number[] {
  return Object.keys(PID_MAP)
    .map((key) => parseInt(key, 10))
    .sort((a, b) => a - b)
}
