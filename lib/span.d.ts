import { AsyncWrapper, KVData, TraceSettings } from '.'

declare class Span {
  constructor(name: string, settings: TraceSettings, data: KVData)

  static makeEntrySpan(name: string, settings: TraceSettings, data: KVData): Span

  descend(name: string, data: KVData): Span

  get async(): boolean
  set async(async: boolean)

  run<T, WT, WP extends unknown[]>(fn: (wrap: AsyncWrapper<WT, WP>) => T): T
  run<T>(fn: () => T): T

  runSync<T>(fn: () => T): T
  runAsync<T, WT, WP extends unknown[]>(fn: (wrap: AsyncWrapper<WT, WP>) => T): T
  runPromise<T>(pfn: () => Promise<T>, opts?: { collectBacktraces?: boolean }): Promise<T>

  enter(data?: KVData): void
  exit(data?: KVData): void

  exitCheckingError(error: Error | string, data?: KVData): void
  setExitError(error: Error | string): void

  info(data: KVData): void
  error(error: Error | string): void

  setIgnoreErrorFn(fn: (error: Error) => boolean): void

  getTransactionName(): string

  static get last(): Span | undefined | null
  static set last(span: Span | undefined | null)
}
export = Span
