import { Debugger } from 'debug'

/**
 * Logger creation options
 */
interface LoggerOptions {
  /**
   * Name of the environment variable used for initialisation which defaults to `DEBUG`
   */
  envName?: string;
  /**
   * Log levels enabled by default
   */
  defaultLevels?: string | string[];
}

/**
 * Standard output logger manager based on the `debug` module
 */
declare class Logger {
  /**
   * @param name - Name of the logger
   * @param opts - Creation options
   */
  constructor(name: string, opts?: LoggerOptions)

  /**
   * Name of the logger
   */
  name: string

  /**
   * Get the full list of currently enabled log levels
   */
  get logLevel(): string
  /**
   * Set the full list of currently enabled log levels
   */
  set logLevel(level: string | string[])

  /**
   * Adds log levels to the current set
   *
   * @param levels - Array or comma separated list of levels to add
   * @returns Current log levels after addition
   *
   * @example Add `warn` and `debug` log levels
   * ```js
   * logger.addEnabled('warn,debug')
   * ```
   */
  addEnabled(levels: string | string[]): string
  /**
   * Removes log levels from the current set
   *
   * @param levels - Array or comma separated list of levels to remove
   * @returns Current log levels after removal
   * 
   * @example Add `debug` log level and remove the rest
   * ```js
   * const previousLogLevel = logger.logLevel
   * logger.addEnabled('debug')
   * logger.removeEnabled(previousLogLevel)
   * ```
   */
  removeEnabled(levels: string | string[]): string
  /**
   * Checks whether the current set contains a level
   * 
   * @param level - Level to check for
   */
  has(level: string): boolean

  /**
   * Creates a new `debug` logger
   * 
   * @param level - Log level
   * @param enable - Whether to also enable the created logger
   */
  make(level: string, enable?: boolean): Debugger
}
export = Logger
