/**
 * Metrics collector state
 */
type MetricsState = 'initial' | 'started' | 'stopped'

/**
 * Metrics collector option
 */
interface MetricsOptions {
  /**
   * Interval at which collected metrics are submitted in milliseconds (default 60'000)
   */
  interval?: number;
  /**
   * Prefix added to metrics
   */
  prefix?: string;
}

/**
 * Metrics collector
 */
declare class Metrics {
  /**
   * @param options - Collector options
   */
  constructor(options?: MetricsOptions)

  /**
   * Starts the metrics collector
   */
  start(): 'started'
  /**
   * Stops the metrics collector
   * 
   * @returns Current state of the collector
   */
  stop(): Exclude<MetricsState, 'started'>

  /**
   * Get the current state of the collector
   */
  getState(): MetricsState
  
  /**
   * Resets the metrics submission interval
   * 
   * @param interval - New submission interval in milliseconds
   */
  resetInterval(interval: number): void

  /**
   * Adds a value metric to the collector
   * 
   * @param metric - Name of the metric
   * @param value - Value of the metric
   * @param n - Count of the metric
   */
  addMetricV(metric: string, value: unknown, n?: number): void
  /**
   * Adds a count metric to the collector
   * 
   * @param metric - Name of the metric
   * @param n - Count of the metric
   */
  addMetricI(metric: string, n?: number): void

  /**
   * Submits the collected metrics
   */
  reportMetrics(): void

  /**
   * Collects memory related metrics from node and v8
   */
  addMemory(): void
}
export = Metrics
