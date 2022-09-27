import Logger from './debug-custom'
import { Debugger } from 'debug'

declare namespace loggers {

type Level = 'error' | 'warn' | 'debug' | 'span' | 'info' | 'patching' | 'probes' | 'bind'

interface Debounce {
  show(): boolean;
  log(...args: Parameters<Debugger>): void;
}
interface DebounceOptions {
  deltaTime?: number;
  deltaCount?: number;
  showDelta?: boolean;
}

interface LoggerGroupDef {
  groupName: string;
  subNames: string[];
}

interface Loggers {
  error: Debugger;
  warn: Debugger;
  debug: Debugger;
  span: Debugger;
  info: Debugger;
  patching: Debugger;
  probes: Debugger;
  bind: Debugger;

  Debounce: new(level: Level, options?: DebounceOptions) => Debounce;

  addGroup(def: LoggerGroupDef): Loggers | undefined;
  deleteGroup(name: string): true | undefined;

  [name: string]: 
    | Debugger
    | { [subname: string]: Debugger }
    | Loggers['Debounce']
    | Loggers['addGroup']
    | Loggers['deleteGroup']
}

const logger: Logger
const loggers: Loggers

}

export = loggers
