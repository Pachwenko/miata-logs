import { XMLParser } from 'fast-xml-parser'
import { getPidName, getPidUnit } from './pidLookup'

export interface LogRecord {
  time: number
  value: number
}

export interface ParsedPID {
  id: number
  name: string
  unit: string
  records: LogRecord[]
}

export interface ParsedLog {
  name: string
  platform: string
  vin: string
  recordedOn: string
  pids: ParsedPID[]
}

interface RawRecord {
  '@_Time': string
  '@_Value': string
}

interface RawPID {
  '@_ID': string
  Record: RawRecord | RawRecord[]
}

interface RawDatalog {
  Version: string
  Name: string
  Description: string
  RecordedOn: string
  Platform: string
  VIN: string
  Data: {
    PID: RawPID | RawPID[]
  }
}

interface RawRoot {
  Datalog: RawDatalog
}

export function parseVTLog(xmlContent: string): ParsedLog {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const parsed: RawRoot = parser.parse(xmlContent)
  const datalog = parsed.Datalog

  const pidArray = Array.isArray(datalog.Data.PID)
    ? datalog.Data.PID
    : [datalog.Data.PID]

  const pids: ParsedPID[] = pidArray.map((rawPid) => {
    const pidId = parseInt(rawPid['@_ID'], 10)
    const recordArray = Array.isArray(rawPid.Record)
      ? rawPid.Record
      : [rawPid.Record]

    const records: LogRecord[] = recordArray.map((record) => ({
      time: parseFloat(record['@_Time']),
      value: parseFloat(record['@_Value']),
    }))

    return {
      id: pidId,
      name: getPidName(pidId),
      unit: getPidUnit(pidId),
      records,
    }
  })

  return {
    name: datalog.Name,
    platform: datalog.Platform,
    vin: datalog.VIN,
    recordedOn: datalog.RecordedOn,
    pids,
  }
}
