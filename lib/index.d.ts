// This file, and all other *.d.ts files, are manually maintained, not generated. They should be changed any time the public API is.
// The test/types.test.ts file should also be updated accordingly to ensure the type declarations behave as expected in practice.

import bindings from './addon'
import log from './loggers'
import { ClientRequest, IncomingMessage, ServerResponse as HTTPResponse } from 'http'
import { EventEmitter } from 'events'
import { Namespace } from 'cls-hooked'
import * as express from 'express'
import * as hapi from '@hapi/hapi'
import * as lambda from 'aws-lambda'

type HTTPRequest = ClientRequest | IncomingMessage

declare namespace apm {

/**
 * Version of the `solarwinds-apm` package
 */
const version: string
/**
 * Root directory of the `solarwinds-apm` package
 */
const root: string

/**
 * Global logger manager
 */
const logger: typeof log.logger
/**
 * Global collection of loggers
 */
const loggers: typeof log.loggers

/**
 * Key-value data which can be used as tags for the collector
 */
interface KVData {
  [key: string]: Error | string | number | boolean
}

/**
 * Comma separated list of log settings
 * 
 * @example Set the log settings
 * ```js
 * apm.logLevel = 'warn,error'
 * ```
 * 
 * @example Get the log settings
 * ```js
 * const settings = apm.logLevel
 * ```
 */
let logLevel: string
/**
 * Adds log levels to the current set
 *
 * @param levels - Array or comma separated list of levels to add
 * @returns Current log levels after addition
 *
 * @example Add `warn` and `debug` log levels
 * ```js
 * apm.logLevelAdd('warn,debug')
 * ```
 */
function logLevelAdd(levels: string[] | string): string
/**
 * Removes log levels from the current set
 *
 * @param levels - Array or comma separated list of levels to remove
 * @returns Current log levels after removal
 * 
 * @example Add `debug` log level and remove the rest
 * ```js
 * const previousLogLevel = apm.logLevel
 * apm.logLevelAdd('debug')
 * apm.logLevelRemove(previousLogLevel)
 * ```
 */
function logLevelRemove(levels: string[] | string): string

/**
 * Package configuration
 */
interface Config {
  domainPrefix: boolean;
  insertTraceIdsIntoLogs: boolean;

  enabled: boolean;
  serviceKey: string;
  hostnameAlias?: string;
  ec2MetadataTimeout?: number;
  triggerTraceEnabled: boolean;
  runtimeMetrics: boolean;
  proxy?: string;

  sampleRate?: number;

  logLevel?: number;
  wrapLambdaHandler?: string;
  tokenBucketCapacity?: number;
  tokenBucketRate?: number;
  transactionName?: string;
  stdoutClearNonblocking?: number;

  traceMode?: 0 | 1 | 'never' | 'always' | 'enabled' | 'disabled';
  reporter?: 'ssl' | 'udp' | 'file';
  endpoint?: string;
  trustedPath?: string;
  unifiedLogging?: 'always' | 'never' | 'preferred';
  bufferSize?: number;
  logFilePath?: string;
  traceMetrics?: boolean;
  histogramPrecision?: number;
  maxTransactions?: number;
  flushMaxWaitTime?: number;
  eventsFlushInterval?: number;
  eventsFlushBatchSize?: number;
  oneFilePerEvent?: boolean;
  metricFormat: 0 | 1 | 2;
}
/**
 * Global package configuration
 */
const cfg: Config

/**
 * Configuration for a module instrumentation probe
 */
interface ProbeConfig {
  /**
   * Whether the probe is enabled
   */
  enabled: boolean;
  /**
   * Whether the probe should collect backtraces
   */
  collectBacktraces?: boolean;
}
/**
 * Configuration specific to the `fs` instrumentation probe
 */
interface FsProbeConfig extends ProbeConfig {
  registered: boolean;
  /**
   * Object mapping method names to errors to ignore
   * 
   * @example Ignore `ENOENT` for `readFile`
   * ```js
   * {
   *   readfile: {
   *     'ENOENT': true,
   *   },
   * }
   */
  ignoreErrors: { [method: string]: { [error: string]: boolean } };
}
/**
 * Configuration specific to the `http` and `https` instrumentation probes
 */
interface HttpProbeConfig extends ProbeConfig {
  includeRemoteUrlParams: boolean;
}
/**
 * Configuration specific to server methods for the `http` and `https` instrumentation probes
 */
interface HttpServerProbeConfig extends HttpProbeConfig {
  'client-ip-header'?: string;
}
/**
 * Configuration specific to SQL instrumentation probes
 */
interface SqlProbeConfig extends ProbeConfig {
  sanitizeSql: boolean;
  sanitizerDropDoubleQuotes: boolean;
  tagSql: boolean;
}
/**
 * Configuration specific to MongoDB instrumantation probes
 */
interface MongoProbeConfig extends ProbeConfig {
  sanitizeObject: boolean;
}
/**
 * Configuration for instrumentation probes that are always enabled
 */
interface EnabledProbeConfig {
  enabled: true;
}
/**
 * Configuration for logging instrumentation probes
 */
interface LoggingProbeConfig {
  enabled: boolean;
}
/**
 * Configuration for each specific instrumentation probe
 */
interface ProbesConfig {
  crypto: ProbeConfig;
  dns: ProbeConfig;
  fs: FsProbeConfig;
  http: HttpServerProbeConfig;
  https: HttpServerProbeConfig;
  'http-client': HttpProbeConfig;
  'https-client': HttpProbeConfig;
  zlib: ProbeConfig;

  amqplib: ProbeConfig;
  'cassandra-driver': SqlProbeConfig;
  'co-render': ProbeConfig;
  director: ProbeConfig;
  express: ProbeConfig;
  '@hapi/hapi': ProbeConfig;
  koa: ProbeConfig;
  'koa-resource-router': ProbeConfig;
  'koa-route': ProbeConfig;
  'koa-router': ProbeConfig;
  levelup: ProbeConfig;
  memcached: ProbeConfig;
  mongodb: MongoProbeConfig;
  mysql: SqlProbeConfig;
  oracledb: SqlProbeConfig;
  pg: SqlProbeConfig;
  'raw-body': ProbeConfig;
  redis: ProbeConfig;
  restify: ProbeConfig;
  tedious: SqlProbeConfig;
  '@hapi/vision': ProbeConfig;

  'aws-sdk': EnabledProbeConfig;
  bcrypt: EnabledProbeConfig;
  bluebird: EnabledProbeConfig;
  'generic-pool': EnabledProbeConfig;
  mongoose: EnabledProbeConfig;
  q: EnabledProbeConfig;

  bunyan: LoggingProbeConfig;
  log4js: LoggingProbeConfig;
  morgan: LoggingProbeConfig;
  pino: LoggingProbeConfig;
  winston: LoggingProbeConfig;
}
const probes: ProbesConfig

interface StringTransactionSetting {
  type: 'url';
  string: string;
}
interface RegexTransactionSetting {
  type: 'url';
  regex: RegExp;
}
type TransactionSetting = StringTransactionSetting | RegexTransactionSetting
const specialUrls: TransactionSetting[]

/**
 * Execution environment for Linux hosts
 */
interface LinuxExecEnv {
  type: 'linux';
  id: undefined;
  /**
   * Value of the `NODE_ENV` environment variable
   */
  nodeEnv: string;
}
/**
 * Execution environment for AWS Lambda hosts
 */
interface LambdaExecEnv {
  type: 'serverless';
  id: 'lambda';
  /**
   * Value of the `NODE_ENV` environment variable
   */
  nodeEnv: string;
}
/**
 * Execution environment
 */
type ExecEnv = LinuxExecEnv | LambdaExecEnv
/**
 * Current execution environment
 */
const execEnv: ExecEnv

/**
 * Extracts the host from a request
 * 
 * @param req - Request to extract the host from
 * @returns Host and possibly port the request is coming from
 */
function getDomainPrefix(req: HTTPRequest): string

/**
 * Creates a logger that consistently formats patching errors
 * 
 * @param name - Name of the module being pathced
 * @returns Function that consistently logs and formats patching errors
 */
function makeLogMissing(name: string): (missing: string | Error) => void

/**
 * Mapping of valid logging modes to native values
 */
const modeMap: {
  0: 0;
  1: 1;
  never: 0;
  always: 1;
  disabled: 0;
  enabled: 1;
}
/**
 * Mapping of native logging mode values to readable names
 */
const modeToStringMap: {
  0: 'disabled';
  1: 'enabled';
}

/**
 * Asynchronous execution context module
 */
const cls: typeof import('ace-context') | undefined
/**
 * Bindings module
 */
const addon: typeof bindings
/**
 * Native reporter
 */
const reporter: typeof bindings.Reporter

/**
 * Current trace mode
 */
let traceMode: keyof typeof modeMap
/**
 * Current sample rate in parts of 1'000'000
 * 
 * @example Set a sample rate to 10%
 * ```js
 * apm.sampleRate = 100000
 * ```
 */
let sampleRate: number

/**
 * Whether the current code path is being traced
 */
const tracing: boolean
/**
 * X-Trace ID of the last event if any
 */
const traceId: string | undefined

/**
 * Last event if any
 */
let lastEvent: Event | undefined | null
/**
 * Last span if any
 */
let lastSpan: Span | undefined | null

/**
 * Asynchronous execution context
 */
const requestStore: Namespace
/**
 * Resets the asynchronous execution context
 */
function resetRequestStore(options?): void
/**
 * Checks whether the asynchronous context is active and healthy
 * 
 * @param msg - Optional message to log
 */
function clsCheck(msg?: string): boolean

/**
 * Generates a track trace
 * 
 * @param text - Message to use as the top stack frame
 * @param n - Depth of the stack trace
 */
function stack(text: string, n?: number): string
/**
 * Generates a backtrace
 */
function backtrace(): string

/**
 * Binds a function to the asynchronous execution context if tracing
 * 
 * @param fn - Function to bind
 * @returns Bound function if tracing or untouched argument otherwise
 */
function bind<F extends Function>(fn: F): F
/**
 * Binds a node event emitter to the asynchronous execution tracing if tracing
 * 
 * @param em - Event emitter to bind
 * @returns Bound emitter if tracing or untouched argument otherwise
 */
function bindEmitter<E extends EventEmitter>(em: E): E

/**
 * Sets a custom transaction name function for the `express` instrumentation probe
 * 
 * @param fn - Function that can either return the custom transaction name or false to use the default
 */
function setCustomTxNameFunction(probe: 'express', fn: (req: express.Request, res: express.Response) => string | false): true
/**
 * Sets a custom transaction name function for the `@hapi/hapi` instrumentation probe
 * 
 * @param fn - Function that can either return the custom transaction name or false to use the default
 */
function setCustomTxNameFunction(probe: '@hapi/hapi', fn: (request: hapi.Request) => string | false): true

/**
 * Event class
 */
const Event: typeof import('./event')
type Event = import('./event')
/**
 * Span class
 */
const Span: typeof import('./span')
type Span = import('./span')
/**
 * Metrics class
 */
const Metrics: typeof import('./metrics')
type Metrics = import('./metrics')

/**
 * Checks whether liboboe is ready to sample
 * 
 * @param ms - Optionally wait at most this amount of time in milliseconds before returning
 * @param obj - When provided its `status` property will be set to the native return status
 */
function readyToSample(ms?: number, obj?: { status?: number }): boolean

/**
 * Trace settings returned by liboboe
 */
interface TraceSettings {
  /**
   * Whether to sample
   */
  doSample: boolean;
  /**
   * Whether to collect metrics
   */
  doMetrics: boolean;
  /**
   * The parent event
   */
  traceTaskId: bindings.Event;
  /**
   * Whether to edge back to the parent ID
   */
  edge: boolean;
  /**
   * Sample decision source
   */
  source: number;
  /**
   * Sample rate used
   */
  rate: number;
  /**
   * Local mode to use
   */
  mode: number;
  /**
   * Whether a trigger trace was requested
   */
  ttRequested: boolean;
  /**
   * X-Trace-Option header value
   */
  ttOptions: string;
  /**
   * X-Trace-Option-Signature header value
   */
  ttSignature: string;
  /**
   * UNIX timestamp value from X-Trace-Options
   */
  ttTimestamp: number;
  inboundXtrace?: string;
}
interface GetTraceSettingsOptions {
  typeRequested?: 0 | 1;
  xtraceOpts?: string;
  xtraceOptsSig?: string;
  xtraceOptsTimestamp?: number;
  customTriggerMode?: 0 | 1;
}
/**
 * Obtains the trace settings from liboboe
 */
function getTraceSettings(traceparent: string, tracestate: string, options?: GetTraceSettingsOptions | number): TraceSettings

/**
 * Determines whether the sample flag is set
 * 
 * @param item - Item to retrieve the sample flag from
 */
function sampling(item: string | Event | bindings.Event): boolean

/**
 * Creates a native event from a traceparent
 * 
 * @param traceparent - Trace parent ID
 * @returns Native event or undefined if the trace parent ID is invalid
 */
function traceToEvent(traceparent: string): bindings.Event | undefined

/**
 * Patches an HTTP response
 */
function patchResponse(res: HTTPResponse): void
/**
 * Adds a finalizer to run when the given response ends
 * 
 * @param res - HTTP response object
 * @param finalizer - Finalizer function called after the response ends
 */
function addResponseFinalizer(res: HTTPResponse, finalizer: () => void): void

/**
 * Span creation info
 */
interface SpanInfo {
  /**
   * Name of the span
   */
  name: string;
  /**
   * Key-value pairs of tags to add to the span
   */
  kvpairs?: KVData;
  /**
   * Optional callback receiving the created span to modify it
   */
  finalize?: (span: Span, last: Span) => void;
}
type SpanOptions = string | (() => SpanInfo)
/**
 * Instrumentation options
 */
interface InstrumentOptions {
  /**
   * Whether to instrument
   */
  enabled?: boolean;
  /**
   * Whether to collect backtraces
   */
  collectBacktraces?: boolean;
}

/**
 * Instruments an HTTP request/response handler
 * 
 * @param span - Span name or function returning span creation info
 * @param run - Code to instrument and run
 * @param options - Instrumentation options
 * @param res - HTTP response to patch
 * 
 * @returns Return value of the instrumented code
 */
function instrumentHttp<T>(
  span: SpanOptions,
  run: () => T,
  options: InstrumentOptions,
  res: HTTPResponse,
): T

//
// INSTRUMENTATION FUNCTIONS AND GENERICS
//
// The functions declarations for callback-style instrumentation functions
// make heavy use of generics and all follow the same pattern.
// This is require to make sure that both the user-provided callback
// and the library-provided wrapper around it have the same type signature
// so that the library-provided callback can only be used in places where
// the user-provided one also can.
// 
// `T` represents the return type of the function receiving the library callback.
// `CT` represents the return type of both callbacks.
// `CP` represents the parameters type of both callbacks.
//
// A `C` generic type could be used instead of AsyncCallback<CT, CP>
// but isn't to make it clear to users that even though the user and library provided callbacks
// have the same signature, they are in fact distinct functions.
//

/**
 * An asynchronous callback
 * 
 * @typeParam T - Return type of the callpack
 * @typeParam P - Parameters type of the callback
 */
type AsyncCallback<T, P extends unknown[]> = (...args: P) => T
type AsyncHandler<P extends unknown[]> = AsyncCallback<unknown, P>
type AsyncWrapper<T = unknown, P extends unknown[] = unknown[]> =
  (cb: AsyncCallback<T, P>, handler?: AsyncHandler<P>) => AsyncCallback<T, P>

/**
 * Instruments callback-style code
 * 
 * @param span - Span name or function returning span creation info
 * @param run - Callback-style code to instrument and run receiving the instrumented callback as its sole argument
 * @param options - Instrumentation options
 * @param callback - Callback to instrument and pass back to the run function
 * 
 * @returns Return value of the instrumented code (not of the callback)
 * 
 * @example
 * ```ts
 * const span = () => ({ name: 'custom', kvpairs: { foo: 'bar' } })
 * const options = { enabled: true, collectBacktraces: true }
 * 
 * function callback(err: ErrnoException | null, data: string | null) {
 *   if (err) console.error(err)
 *   else console.log(data)
 * }
 * 
 * apm.instrument(span, (done) => {
 *   fs.readFile('example.txt', { encoding: 'utf8' }, done)
 * }, options, callback)
 * ```
 */
function instrument<T, CT, CP extends unknown[]>(
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  options: InstrumentOptions,
  callback: AsyncCallback<CT, CP>,
): T
/**
 * Instruments callback-style code
 * 
 * @param span - Span name or function returning span creation info
 * @param run - Callback-style code to instrument and run receiving the instrumented callback as its sole argument
 * @param callback - Callback to instrument and pass back to the run function
 * 
 * @returns Return value of the instrumented code (not of the callback)
 * 
 * @example
 * ```ts
 * const span = () => ({ name: 'custom', kvpairs: { foo: 'bar' } })
 * 
 * function callback(err: ErrnoException | null, data: string | null) {
 *   if (err) console.error(err)
 *   else console.log(data)
 * }
 * 
 * apm.instrument(span, (done) => {
 *   fs.readFile('example.txt', { encoding: 'utf8' }, done)
 * }, callback)
 * ```
 */
function instrument<T, CT, CP extends unknown[]>(
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  callback: AsyncCallback<CT, CP>,
): T
/**
 * Instruments synchronous code
 * 
 * @param span - Span name or function returning span creation info
 * @param run - Synchronous code to instrument and run
 * @param options - Instrumentation options
 * 
 * @returns Return value of the instrumented code
 * 
 * @example
 * ```js
 * instrument('custom', () => fs.readFileSync('example.bin'))
 * ```
 */
function instrument<T>(
  span: SpanOptions,
  run: () => T,
  options?: InstrumentOptions,
): T

/**
 * Instruments async code
 * 
 * @param span - Span name or function returning span creation info
 * @param run - Async code to instrument and run
 * @param options - Instrumentation options
 * 
 * @returns Wrapped promise which will resolve or reject to the same values as the one returned by the instrumented code
 * 
 * @example
 * ```js
 * const span = () => ({ name: 'custom', kvpairs: { foo: 'bar' } })
 * 
 * async function google() {
 *   const res = await axios.get('https://google.com')
 *   return res.data
 * }
 * 
 * pInstrument(span, google)
 *   .then(console.log)
 *   .catch(console.error)
 * ```
 */
function pInstrument<T>(
  span: SpanOptions,
  run: () => Promise<T>,
  options?: InstrumentOptions,
): Promise<T>

/**
 * Instrumentation continuation options
 */
interface InstrumentContinueOptions extends InstrumentOptions {
  /**
   * Whether to ignore the existing context and create a new trace
   */
  forceNewTrace?: boolean
  /**
   * Custom transaction name or function returning one
   */
  customTxName?: string | (() => string)
}

/**
 * Starts or continues a trace and instruments callback-style code using it
 * 
 * A trace can be continued using a X-Trace ID received from an external source.
 * For instance this could be HTTP or message queue headers.
 * 
 * See {@link instrument} for more details and usage examples.
 * 
 * @param traceparent - traceparent ID to continue from
 * @param tracestate - tracestate ID to continue from
 * @param span - Span name or function returning span creation info
 * @param run - Callback-style code to instrument and run receiving the instrumented callback as its sole argument
 * @param options - Instrumentation options
 * @param callback - Callback to instrument and pass back to the run function
 * 
 * @returns Return value of the instrumented code (not of the callback)
 */
function startOrContinueTrace<T, CT, CP extends unknown[]>(
  traceparent: string | null,
  tracestate: string | null,
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  options: InstrumentOptions,
  callback: AsyncCallback<CT, CP>,
): T
/**
 * Starts or continues a trace and instruments callback-style code using it
 * 
 * A trace can be continued using a X-Trace ID received from an external source.
 * For instance this could be HTTP or message queue headers.
 * 
 * See {@link instrument} for more details and usage examples.
 * 
 * @param traceparent - traceparent ID to continue from
 * @param tracestate - tracestate ID to continue from
 * @param span - Span name or function returning span creation info
 * @param run - Callback-style code to instrument and run receiving the instrumented callback as its sole argument
 * @param callback - Callback to instrument and pass back to the run function
 * 
 * @returns Return value of the instrumented code (not of the callback)
 */
function startOrContinueTrace<T, CT, CP extends unknown[]>(
  traceparent: string | null,
  tracestate: string | null,
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  callback: AsyncCallback<CT, CP>,
): T
/**
 * Starts or continues a trace and instruments synchronous code using it
 * 
 * A trace can be continued using a X-Trace ID received from an external source.
 * For instance this could be HTTP or message queue headers.
 * 
 * See {@link instrument} for more details and usage examples.
 * 
 * @param traceparent - traceparent ID to continue from
 * @param tracestate - tracestate ID to continue from
 * @param span - Span name or function returning span creation info
 * @param run - Synchronous code to instrument and run
 * @param options - Instrumentation options
 * 
 * @returns Return value of the instrumented code
 */
function startOrContinueTrace<T>(
  traceparent: string | null,
  tracestate: string | null,
  span: SpanOptions,
  run: () => T,
  options?: InstrumentContinueOptions,
): T

/**
 * Starts or continues a trace and instruments async code using it
 * 
 * A trace can be continued using a X-Trace ID received from an external source.
 * For instance this could be HTTP or message queue headers.
 * 
 * See {@link pInstrument} for more details and usage examples.
 * 
 * @param traceparent - traceparent ID to continue from
 * @param tracestate - tracestate ID to continue from
 * @param span - Span name or function returning span creation info
 * @param run - Async code to instrument
 * @param options - Instrumentation options
 * 
 * @returns Wrapped promise which will resolve or reject to the same values as the one returned by the instrumented code
 */
function pStartOrContinueTrace<T>(
  traceparent: string | null,
  tracestate: string | null,
  span: SpanOptions,
  run: () => Promise<T>,
  options?: InstrumentContinueOptions,
): Promise<T>

/**
 * Reports an error in the current trace
 * 
 * @param error - Error to report
 */
function reportError(error: Error | string): void
/**
 * Report an info event in the current trace
 * 
 * @param data - The data to report
 */
function reportInfo(data: KVData): void

/**
 * Reportable metric
 */
interface Metric {
  /**
   * Name of the metric
   */
  name: string;
  /**
   * Count of the metric which defaults to 1
   */
  count?: number;
  /**
   * Value of the metric
   */
  value?: number;
  /**
   * Optional tags to attach to the metric
   */
  tags?: KVData;
  /**
   * Whether to add a host tag before sending the metric
   */
  addHostTag?: boolean;
}

/**
 * Options for sending metrics
 */
interface MetricsOptions {
  /**
   * Extra tags to be attached to metrics if they are not already defined
   */
  tags?: KVData;
  /**
   * Whether to add a host tag to metrics before sending them
   */
  addHostTag?: boolean;
}

/**
 * Sends custom metrics
 * 
 * Metrics are aggregated by name and tags and sent every 60 seconds.
 * 
 * @param metrics - Metric or array of metrics to send
 * @param options - Options for sending
 * 
 * @returns Object containing an array of metrics that failed to submit
 * 
 * @example Send a single metric
 * ```js
 * // no value or count provided so defaults to count of 1
 * apm.sendMetrics({ name: 'basic.count' })
 * ```
 * 
 * @example Send multiple metrics at once
 * ```js
 * apm.sendMetrics(
 *   [
 *     { name: 'basic.count', count: 2 }, // `basic.count` metric sent as having occured twice
 *     { name: 'basic.value', value: 10 }, // `basic.value` metric sent as having occurend once with value `10`
 *     { name: 'basic.both', count: 3, value: 5 }, // `basic.both` metric sent as having occured thrice with value `5` 
 *   ],
 *   { tags: { class: 'status' } } // adds a `class` tag with value `status` to each metric unless already specified in the metric itself
 * )
 * ```
 */
function sendMetrics(metrics: Metric | Metric[], options?: MetricsOptions): { errors: Metric[] }

/**
 * Object representation of a trace
 */
interface TraceObjectForLog {
  trace_id: string;
  span_id: string;
  trace_flags: string;
}
/**
 * Obtains an object representation of the current trace
 * 
 * The primary intended use for this is to insert custom metadata in log events.
 * 
 * @example Setup log4js to print the current trace info in JSON form
 * ```js
 * log4js.addLayout('json', (config) => (logEvent) => {
 *   logEvent.context = { ...logEvent.context, ...apm.getTraceObjectForLog() }
 *   return JSON.stringify(logEvent)
 * })
 *
 * log4js.configure({
 *   appenders: {
 *     out: { type: 'stdout', layout: { type: 'json' } }
 *   },
 *   categories: {
 *     default: { appenders: ['out'], level: 'info' }
 *   }
 * })
 * 
 * const logger = log4js.getLogger()
 * logger.info('doing something')
 * ```
 */
function getTraceObjectForLog(): TraceObjectForLog | null
/**
 * Obtains a string representation of the current trace
 * 
 * The primary intended use for this is to insert custom metadata in log events.
 * 
 * @example Setup log4js to print the current trace info in text form
 * ```js
 * log4js.configure({
 *   appenders: {
 *     out: {
 *       type: 'stdout',
 *       layout: {
 *         type: 'pattern',
 *         pattern: '%d %p %c: %m is: %x{trace} %n',
 *         tokens: {
 *           trace: apm.getTraceStringForLog
 *         }
 *       }
 *     }
 *   },
 *   categories: { default: { appenders: ['out'], level: 'info' } }
 * })
 * 
 * const logger = log4js.getLogger()
 * logger.info('token from api')
 * ```
 */
function getTraceStringForLog(): string

type LambdaHandler<T, E, C> =
  | ((event: E, context: C, callback: lambda.APIGatewayProxyCallback) => T)
  | ((event: E, context: C) => Promise<T>)
  | ((event: E) => Promise<T>)
  | lambda.APIGatewayProxyHandler

/**
 * Instruments an AWS Lambda handler
 * 
 * @param handler - Lambda handler function to instrument
 * @returns Instrumented async wrapper around the provided handler
 * 
 * @example Instrument an async handler
 * ```js
 * async function handler(e, ctx) {
 *   // ...
 * }
 * 
 * const wrapped = apm.wrapLambdaHandler
 * export { wrapped as handler }
 * ```
 * 
 * @example Instrument a callback-style handler
 * ```js
 * function handler(e, ctx, done) {
 *   // ...
 *   if (err) done(err)
 *   else done(null, result)
 * }
 * 
 * exports.handler = apm.wrapLambdaHandler(handler)
 * ```
 */
function wrapLambdaHandler<
  T extends lambda.APIGatewayProxyResult = lambda.APIGatewayProxyResult,
  E extends lambda.APIGatewayEvent = lambda.APIGatewayEvent,
  C extends lambda.Context = lambda.Context,
>(handler: LambdaHandler<T, E, C>): (event: E, context: C) => Promise<T>

}
export = apm
