import { AsyncWrapper, KVData, TraceSettings, getTraceSettings } from '.'

/**
 * Execution span
 */
declare class Span {
  /**
   * @param name - Name of the span
   * @param settings - Settings returned from {@link getTraceSettings}
   * @param data - Key-value pairs of data to add to the span
   */
  constructor(name: string, settings: TraceSettings, data: KVData)

  /**
   * Creates a new entry span
   * 
   * The entry span is the top span in a new trace in this process.
   * It might be continued from another process, for instance if an X-Trace-ID header
   * was attached to an inbound HTTP/S request
   * 
   * @param name - Name of the span
   * @param settings - Settings returned from {@link getTraceSettings}
   * @param data - Key-value pairs of data to add to the span
   */
  static makeEntrySpan(name: string, settings: TraceSettings, data: KVData): Span

  /**
   * Creates a new span descending from the current span
   * 
   * @param name - Name of the span
   * @param data - Key-value pairs of data to add to the span
   */
  descend(name: string, data: KVData): Span

  /**
   * Get whether the span is async
   */
  get async(): boolean
  /**
   * Set whether the span is async
   */
  set async(async: boolean)

  /**
   * Runs a callback-style function within the context of this span
   * 
   * @param fn - Callback-style function to run receiving a wrapper that must be called on its callback as its sole argument
   * @returns Return value of the function (not of the callback)
   * 
   * @example
   * ```js
   * span.run(function (wrap) {
   *   callToTrace(wrap((err, data) => {
   *     // ...
   *   }))
   * })
   * ```
   */
  run<T, WT, WP extends unknown[]>(fn: (wrap: AsyncWrapper<WT, WP>) => T): T
  /**
   * Runs a synchronous function within the context of this span
   * 
   * @param fn - Synchronous function to run
   * @returns Return value of the function
   */
  run<T>(fn: () => T): T

  /**
   * Runs an async function within the context of this span
   * 
   * @param pfn - Async function to run
   * @param opts - `collectBacktraces` indicates whether to add a backtrace key-value pair to the span
   * @returns Wrapped promise which will resolve or reject to the same values as the one returned by the function
   */
  runPromise<T>(pfn: () => Promise<T>, opts?: { collectBacktraces?: boolean }): Promise<T>

  /**
   * Runs a synchronous function within the context of this span
   * 
   * @param fn - Synchronous function to run
   * @returns Return value of the function
   */
  runSync<T>(fn: () => T): T
  /**
   * Runs a callback-style function within the context of this span
   * 
   * @param fn - Callback-style function to run receiving a wrapper that must be called on its callback as its sole argument
   * @returns Return value of the function (not of the callback)
   */
  runAsync<T, WT, WP extends unknown[]>(fn: (wrap: AsyncWrapper<WT, WP>) => T): T

  /**
   * Sends the enter event
   * 
   * @param data - Optional key-value pairs to add to the enter event
   * 
   * @example Instrumenting a synchronous call
   * ```js
   * span.enter()
   * synchronousCall()
   * span.exit()
   * ```
   * 
   * @example Instrumenting a callback-style call
   * ```js
   * span.enter()
   * callbackStyleCall(apm.bind(function(err, data) {
   *   span.exit()
   *   callback(err, data)
   * }))
   * ```
   */
  enter(data?: KVData): void
  /**
   * Sends the exit event
   * 
   * @param data - Optional key-value pairs to add to the exit event
   */
  exit(data?: KVData): void

  /**
   * Sends the exit event with an error status
   * 
   * @param error - Error to add to the event
   * @param data - Optional key-value pairs to add to the exit event
   */
  exitCheckingError(error: Error | string, data?: KVData): void
  /**
   * Sets an error to be sent with the exit event
   * 
   * @param error - Error to add to the event
   */
  setExitError(error: Error | string): void

  /**
   * Creates and sends an info event
   * 
   * @param data - Kev-value pairs of info
   */
  info(data: KVData): void
  /**
   * Creates and sends an error event
   * 
   * @param error - Error to send with the event
   */
  error(error: Error | string): void

  /**
   * Obtains the transaction name
   * 
   * Only top-level spans have transaction names, for others the default value is used.
   */
  getTransactionName(): string

  /**
   * Get the last span if any
   */
  static get last(): Span | undefined | null
  /**
   * Set the last span if any
   */
  static set last(span: Span | undefined | null)
}
export = Span
