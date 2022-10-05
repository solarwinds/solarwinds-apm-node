import Logger from './debug-custom'
import { Debugger } from 'debug'

declare namespace loggers {

/**
 * Builtin log level
 */
type Level = 'error' | 'warn' | 'debug' | 'span' | 'info' | 'patching' | 'probes' | 'bind'

/**
 * Debounced logger
 */
interface Debounce {
  /**
   * Whether messages will currently be logged
   */
  show(): boolean;
  /**
   * Logs a debounced message
   */
  log(...args: Parameters<Debugger>): void;
}
/**
 * Debounced logger options
 */
interface DebounceOptions {
  /**
   * Time span in milliseconds (default 5000)
   */
  deltaTime?: number;
  /**
   * Maximum amount of messages to show in said time span (default 100)
   */
  deltaCount?: number;
  /**
   * Whether to show the message count in the current delta in log messages
   */
  showDelta?: boolean;
}

/**
 * Logger group definition
 */
interface LoggerGroupDef {
  /**
   * Name of the group
   */
  groupName: string;
  /**
   * Subnames of each logger in the group
   */
  subNames: string[];
}

/**
 * Collection of loggers
 */
interface Loggers {
  /**
   * Error logger
   */
  error: Debugger;
  /**
   * Warning logger
   */
  warn: Debugger;
  /**
   * Debug logger
   */
  debug: Debugger;
  /**
   * Span logger
   */
  span: Debugger;
  /**
   * Info logger
   */
  info: Debugger;
  /**
   * Patching logger
   */
  patching: Debugger;
  /**
   * Probes logger
   */
  probes: Debugger;
  /**
   * Binding logger
   */
  bind: Debugger;

  /**
   * Debounced logger contructor
   */
  Debounce: new(level: Level, options?: DebounceOptions) => Debounce;

  /**
   * Adds a new group of loggers
   * 
   * @param def - Group definition
   * 
   * @returns Updated logger collection
   */
  addGroup(def: LoggerGroupDef): Loggers | undefined;
  /**
   * Deletes an existing group of loggers
   * 
   * @param name - Name of the group to delete
   * 
   * @returns `true` on success
   */
  deleteGroup(name: string): true | undefined;

  [name: string]: 
    | Debugger
    | { [subname: string]: Debugger }
    | Loggers['Debounce']
    | Loggers['addGroup']
    | Loggers['deleteGroup']
}

/**
 * Global logger manager instance
 */
const logger: Logger
/**
 * Global collection of loggers
 */
const loggers: Loggers

}

export = loggers
