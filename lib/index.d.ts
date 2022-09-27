import Event from './event'
import Span from './span'
import Metrics from './metrics'
import bindings from './addon'
import log from './loggers'
import { ClientRequest as HTTPRequest, ServerResponse as HTTPResponse } from 'http'
import { EventEmitter } from 'events'
import { Namespace } from 'cls-hooked'
import lambda from 'aws-lambda'

declare namespace apm {

const version: typeof import('../package.json').version
const root: string
const omitTraceId: symbol

const logger: typeof log.logger
const loggers: typeof log.loggers

interface KVData {
    error: Error | string | number | boolean
    [key: string]: Error | string | number | boolean
}

let logLevel: string
function logLevelAdd(levels: string[] | string): string
function logLevelRemove(levels: string[] | string): string

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

  traceMode?: 0 | 1;
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
}
const cfg: Config

interface ProbeConfig {
  enabled: boolean;
  collectBacktraces?: boolean;
}
interface FsProbeConfig extends ProbeConfig {
  registered: boolean;
  ignoreErrors: { [method: string]: { [error: string]: boolean } };
}
interface HttpProbeConfig extends ProbeConfig {
  includeRemoteUrlParams: boolean;
}
interface HttpServerProbeConfig extends HttpProbeConfig {
  'client-ip-header'?: string;
}
interface SqlProbeConfig extends ProbeConfig {
  sanitizeSql: boolean;
  sanitizerDropDoubleQuotes: boolean;
  tagSql: boolean;
}
interface MongoProbeConfig extends ProbeConfig {
  sanitizeObject: boolean;
}
interface EnabledProbeConfig {
  enabled: true;
}
interface LoggingProbeConfig {
  enabled: boolean;
}
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

interface LinuxExecEnv {
  type: 'linux';
  id: undefined;
  nodeEnv: string;
}
interface LambdaExecEnv {
  type: 'serverless';
  id: 'lambda';
  nodeEnv: string;
}
type ExecEnv = LinuxExecEnv | LambdaExecEnv
const execEnv: ExecEnv

function getDomainPrefix(req: HTTPRequest): string

function makeLogMissing(name: string): (missing: string) => void

const modeMap: {
  0: 0;
  1: 1;
  never: 0;
  always: 1;
  disabled: 0;
  enabled: 1;
}
const modeToStringMap: {
  0: 'disabled';
  1: 'enabled';
}

const cls: typeof import('ace-context') | undefined
const addon: typeof bindings
const reporter: typeof bindings.Reporter

let startup: boolean

let traceMode: keyof typeof modeMap
let sampleRate: number

const tracing: boolean
const traceId: string

let lastEvent: Event | undefined | null
let lastSpan: Span | undefined | null
const maps: Object

const lambda: {} | undefined

const requestStore: Namespace
function resetRequestStore(options?): void
function clsCheck(msg?: string): boolean

function stack(text: string, n?: number): string
function backtrace(): string

function bind<F extends Function>(fn: F): F
function bindEmitter<E extends EventEmitter>(em: E): E

const wrappedFlag: symbol

const Event: Event
const Span: Span
const Metrics: Metrics

function readyToSample(ms: number, obj?: { status?: number }): boolean

interface TraceSettings {
  doSample: boolean;
  doMetrics: boolean;
  traceTaskId: Event;
  edge?: boolean;
  source: number;
  rate: number;
  mode: number;
  ttRequested: boolean;
  ttOptions: string;
  ttSignature: string;
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
function getTraceSettings(traceparent: string, tracestate: string, options?: GetTraceSettingsOptions | number): TraceSettings

function sampling(item: string | Event | bindings.Event): boolean

function traceToEvent(traceparent: string): bindings.Event

function patchResponse(res: HTTPResponse): void
function addResponseFinalizer(res: HTTPResponse, finalizer: () => void): void

interface SpanInfo {
  name: string;
  kvpairs?: Object;
  finalize?: (span: Span, last: Span) => void;
}
type SpanOptions = string | (() => SpanInfo)
interface InstrumentOptions {
  enabled?: boolean;
  collectBacktraces?: boolean;
}

function instrumentHttp<T>(
  span: SpanOptions,
  run: () => T,
  options: InstrumentOptions,
  res: HTTPResponse,
): T

type AsyncCallback<T, P extends unknown[]> = (...args: P) => T
type AsyncHandler<P extends unknown[]> = AsyncCallback<unknown, P>
type AsyncWrapper<T = unknown, P extends unknown[] = unknown[]> =
  (cb: AsyncCallback<T, P>, handler?: AsyncHandler<P>) => AsyncCallback<T, P>

function instrument<T, CT, CP extends unknown[]>(
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  options: InstrumentOptions,
  callback: AsyncCallback<CT, CP>,
): T
function instrument<T, CT, CP extends unknown[]>(
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  callback: AsyncCallback<CT, CP>,
): T
function instrument<T>(
  span: SpanOptions,
  run: () => T,
  options?: InstrumentOptions,
): T

function pInstrument<T>(
  span: SpanOptions,
  run: () => Promise<T>,
  options?: InstrumentOptions,
): Promise<T>

interface InstrumentContinueOptions extends InstrumentOptions {
  forceNewTrace?: boolean
  customTxName?: string | (() => string)
}

function startOrContinueTrace<T, CT, CP extends unknown[]>(
  traceparent: string,
  tracestate: string,
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  options: InstrumentOptions,
  callback: AsyncCallback<CT, CP>,
): T
function startOrContinueTrace<T, CT, CP extends unknown[]>(
  traceparent: string,
  tracestate: string,
  span: SpanOptions,
  run: (done: AsyncCallback<CT, CP>) => T,
  callback: AsyncCallback<CT, CP>,
): T
function startOrContinueTrace<T>(
  traceparent: string,
  tracestate: string,
  span: SpanOptions,
  run: () => T,
  options?: InstrumentContinueOptions,
): T

function pStartOrContinueTrace<T>(
  traceparent: string,
  tracestate: string,
  span: SpanOptions,
  run: () => Promise<T>,
  options?: InstrumentContinueOptions,
): Promise<T>

function reportInfo(data: KVData): void
function reportError(error: Error | string): void

interface Metric {
  name: string;
  count?: number;
  value?: number;
  tags?: KVData;
  addHostTag?: boolean;
}
interface MetricsOptions {
  tags?: KVData;
  addHostTag?: boolean;
}

function sendMetrics(metrics: Metric | Metric[], options?: MetricsOptions): { errors: Metric[] }

interface TraceObjectForLog {
  trace_id: string;
  span_id: string;
  trace_flags: string;
}
function getTraceObjectForLog(): TraceObjectForLog | null
function getTraceStringForLog(): string

type LambdaHandler<T, E, C> =
  | ((event: E, context: C, callback: lambda.APIGatewayProxyCallback) => T)
  | ((event: E, context: C) => Promise<T>)
  | ((event: E) => Promise<T>)

function wrapLambdaHandler<
  T extends lambda.APIGatewayProxyResult = lambda.APIGatewayProxyResult,
  E extends lambda.APIGatewayEvent = lambda.APIGatewayEvent,
  C extends lambda.Context = lambda.Context,
>(handler: LambdaHandler<T, E, C>): (event: E, context: C) => Promise<T>

}
export = apm
