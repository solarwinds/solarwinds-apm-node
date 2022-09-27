type MetricsState = 'initial' | 'started' | 'stopped'

interface MetricsOptions {
  interval?: number;
  prefix?: string;
}

declare class Metrics {
  constructor(options?: MetricsOptions)

  start(): 'started'
  stop(): Exclude<MetricsState, 'started'>

  getState(): MetricsState
  
  resetInterval(interval: number): void

  addMetricV(metric: string, value: unknown, n?: number): void
  addMetricI(metric: string, n?: number): void

  reportMetrics(): void

  addMetrics(): void
  addMemory(): void
}
export = Metrics
