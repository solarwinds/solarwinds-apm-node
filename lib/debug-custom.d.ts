import { Debugger } from 'debug'

interface LoggerOptions {
  envName?: string;
  defaultLevels?: string | string[];
}

declare class Logger {
  constructor(name: string, opts?: LoggerOptions)

  name: string

  get logLevel(): string
  set logLevel(level: string | string[])

  addEnabled(levels: string | string[]): string
  removeEnabled(levels: string | string[]): string
  has(level: string): boolean

  make(level: string, enable?: boolean): Debugger
}
export = Logger
