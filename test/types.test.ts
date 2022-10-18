// This file is not actually meant to be run but only typechecked using tsc
// to make sure the type declarations fit the expected usage.

import apm from '..'
import * as events from 'node:events'
import * as fs from 'node:fs'
import * as http from 'node:http'
import * as lambda from 'aws-lambda'

let nil: null
let pnil: Promise<null>

let kv: apm.KVData
kv = {}
kv = { s: 'string' }
kv = { n: 0 }
kv = { b: true }
kv = { e: new Error() }
// @ts-expect-error
kv = { invalid: [] }
// @ts-expect-error
kv = { invalid: {} }

let traceSettings: apm.TraceSettings
traceSettings = apm.getTraceSettings('parent', 'state')
traceSettings = apm.getTraceSettings('parent', 'state', {})
traceSettings = apm.getTraceSettings('parent', 'state', 10)

const event: apm.Event = new apm.Event('span', 'label')
let span: apm.Span = new apm.Span('name', traceSettings, kv)
const metrics: apm.Metrics = new apm.Metrics()

const request = new http.ClientRequest('url')
const response = new http.ServerResponse({} as http.IncomingMessage)

const version: string = apm.version
// @ts-expect-error
apm.version = 'version'

const root: string = apm.root
// @ts-expect-error
apm.root = 'root'

const logLevel: string = apm.logLevel
apm.logLevel = 'level'

let logLevels: string
logLevels = apm.logLevelAdd('info,debug')
logLevels = apm.logLevelAdd(['info', 'debug'])
logLevels = apm.logLevelRemove('info,debug')
logLevels = apm.logLevelRemove(['info', 'debug'])

const config: apm.Config = apm.cfg
const execEnv: apm.ExecEnv = apm.execEnv

const logMissing = apm.makeLogMissing("name")
logMissing("missing")
logMissing(new Error())

apm.traceMode = 0
apm.traceMode = 1
apm.traceMode = 'never'
apm.traceMode = 'always'
apm.traceMode = 'disabled'
apm.traceMode = 'enabled'
// @ts-expect-error
apm.traceMode = 2
// @ts-expect-error
apm.traceMode = 'no'
// @ts-expect-error
apm.traceMode = 'yes'

const sampleRate: number = apm.sampleRate
apm.sampleRate = 100_000

const tracing: boolean = apm.tracing
// @ts-expect-error
apm.tracing = true

const traceId: string | undefined = apm.traceId
// @ts-expect-error
apm.traceId = 'id'

let lastEvent: apm.Event | null | undefined = apm.lastEvent
apm.lastEvent = event
apm.lastEvent = null
apm.lastEvent = undefined

let lastSpan: apm.Span | null | undefined = apm.lastSpan
apm.lastSpan = span
apm.lastSpan = null
apm.lastSpan = undefined

let stack: string
stack = apm.stack('text')
stack = apm.stack('text', 10)

const backtrace: string = apm.backtrace()

let bound: Function
bound = apm.bind(() => {})
bound = apm.bind(function() {})

const boundEmitter: events.EventEmitter = apm.bindEmitter(new events.EventEmitter())

apm.setCustomTxNameFunction('express', (req, res) => 'name')
apm.setCustomTxNameFunction('express', (req, res) => false)
// @ts-expect-error
apm.setCustomTxNameFunction('express', (req, res) => true)
apm.setCustomTxNameFunction('@hapi/hapi', (req) => 'name')
apm.setCustomTxNameFunction('@hapi/hapi', (req) => false)
// @ts-expect-error
apm.setCustomTxNameFunction('@hapi/hapi', (req) => true)

let readyToSample: boolean
readyToSample = apm.readyToSample()
readyToSample = apm.readyToSample(1000)
readyToSample = apm.readyToSample(1000, { status: undefined })

let sampling: boolean
sampling = apm.sampling('traceid')
sampling = apm.sampling(event)

apm.patchResponse(response)
apm.addResponseFinalizer(response, () => {})

let spanInfo: apm.SpanInfo
spanInfo = {
    name: 'name',
}
spanInfo = {
    name: 'name',
    kvpairs: kv,
}
spanInfo = {
    name: 'name',
    finalize(span: apm.Span, last: apm.Span) {},
}
// @ts-expect-error
spanInfo = {}

let spanOptions: apm.SpanOptions
spanOptions = 'span'
spanOptions = () => spanInfo
// @ts-expect-error
spanOptions = spanInfo

let instrumentOptions: apm.InstrumentOptions
instrumentOptions = {}
instrumentOptions = { enabled: true }
instrumentOptions = { collectBacktraces: true }

nil = apm.instrumentHttp(
    spanOptions,
    () => null,
    instrumentOptions,
    response
)

nil = apm.instrument(
    spanOptions,
    (done) => {
        fs.readFile('file', done)
        return null
    },
    instrumentOptions,
    (err: NodeJS.ErrnoException | null, data: Buffer) => {}
)
nil = apm.instrument(
    spanOptions,
    (done) => {
        // @ts-expect-error
        fs.readFile('file', done)
        return null
    },
    instrumentOptions,
    (err: null, data: string) => {}
)
nil = apm.instrument(
    spanOptions,
    (done) => {
        fs.readFile('file', done)
        return null
    },
    (err: NodeJS.ErrnoException | null, data: Buffer) => {}
)

nil = apm.instrument(spanOptions, () => null)
nil = apm.instrument(spanOptions, () => null, instrumentOptions)
// @ts-expect-error
nil = apm.instrument(spanOptions, () => true)

pnil = apm.pInstrument(spanOptions, async () => null)
pnil = apm.pInstrument(spanOptions, async () => null, instrumentOptions)
pnil = apm.pInstrument(spanOptions, () => Promise.resolve(null))
// @ts-expect-error
pnil = apm.pInstrument(spanOptions, async () => true)

let instrumentContinueOptions: apm.InstrumentContinueOptions
instrumentContinueOptions = {}
instrumentContinueOptions = { enabled: true }
instrumentContinueOptions = { collectBacktraces: true }
instrumentContinueOptions = { forceNewTrace: true }
instrumentContinueOptions = { customTxName: 'name' }
instrumentContinueOptions = { customTxName: () => 'name' }
// @ts-expect-error
instrumentContinueOptions = { customTxName: () => false }

nil = apm.startOrContinueTrace(
    'parent',
    'state',
    spanOptions,
    (done) => {
        fs.readFile('file', done)
        return null
    },
    instrumentContinueOptions,
    (err: NodeJS.ErrnoException | null, data: Buffer) => {}
)
nil = apm.startOrContinueTrace(
    'parent',
    null,
    spanOptions,
    (done) => {
        // @ts-expect-error
        fs.readFile('file', done)
        return null
    },
    instrumentContinueOptions,
    (err: null, data: string) => {}
)
nil = apm.startOrContinueTrace(
    null,
    'state',
    spanOptions,
    (done) => {
        fs.readFile('file', done)
        return null
    },
    (err: NodeJS.ErrnoException | null, data: Buffer) => {}
)

nil = apm.startOrContinueTrace('parent', 'state', spanOptions, () => null)
nil = apm.startOrContinueTrace(null, null, spanOptions, () => null, instrumentContinueOptions)
// @ts-expect-error
nil = apm.startOrContinueTrace('parent', 'state', spanOptions, () => true)

pnil = apm.pStartOrContinueTrace('parent', 'state', spanOptions, async () => null)
pnil = apm.pStartOrContinueTrace('parent', null, spanOptions, async () => null, instrumentContinueOptions)
pnil = apm.pStartOrContinueTrace(null, 'state', spanOptions, () => Promise.resolve(null))
// @ts-expect-error
pnil = apm.pStartOrContinueTrace(spanOptions, async () => true)
// @ts-expect-error
apm.pStartOrContinueTrace(spanOptions, () => null)

apm.reportError('error')
apm.reportError(new Error())

apm.reportInfo(kv)
// @ts-expect-error
apm.reportInfo('info')

let metric: apm.Metric
metric = {
    name: 'name',
    count: 2,
}
metric = {
    name: 'name',
    value: 2,
}
metric = {
    name: 'name',
    tags: kv,
    addHostTag: true,
}
// @ts-expect-error
metric = {
    count: 2,
}
metric = {
    name: 'name',
    // @ts-expect-error
    value: 'value',
}

let metricsOptions: apm.MetricsOptions
metricsOptions = {}
metricsOptions = { tags: kv }
metricsOptions = { addHostTag: true }

let metricsResult: { errors: apm.Metric[] }
metricsResult = apm.sendMetrics(metric)
metricsResult = apm.sendMetrics(metric, metricsOptions)
metricsResult = apm.sendMetrics([metric])
metricsResult = apm.sendMetrics([metric], metricsOptions)
// @ts-expect-error
metricsResult = apm.sendMetrics('metric')
// @ts-expect-error
metricsResult = apm.sendMetrics(['metric'])

const traceObjectForLog = apm.getTraceObjectForLog()
const tofl_trace_id: string = traceObjectForLog!.trace_id
const tofl_span_id: string = traceObjectForLog!.span_id
const tofl_trace_flags: string = traceObjectForLog!.trace_flags

const traceStringForLog: string = apm.getTraceStringForLog()

let handler: lambda.APIGatewayProxyHandler = async (event, ctx) => ({ statusCode: 200, body: 'hi' }) 
handler = apm.wrapLambdaHandler(handler)

// *** LOGGING

apm.loggers.debug('debug')
apm.loggers.info('info')
apm.loggers.warn('warn')
apm.loggers.error('error')
apm.loggers.span('span')
apm.loggers.patching('patching')
apm.loggers.bind('bind')
apm.loggers.probes('probes')

let debounced = new apm.loggers.Debounce('info')
debounced = new apm.loggers.Debounce('patching', {
    deltaTime: 5000,
    deltaCount: 100,
    showDelta: true,
})
// @ts-expect-error
debounced = new apm.loggers.Debounce('custom')

apm.loggers.addGroup({
    groupName: 'group',
    subNames: ['logger']
})
// @ts-expect-error
apm.loggers.addGroup('group')

apm.loggers.deleteGroup('group')

const loggerName: string = apm.logger.name
apm.logger.name = 'name'

const loggerLogLevel: string = apm.logger.logLevel
apm.logger.logLevel = 'level'
apm.logger.logLevel = ['level']

let loggerLogLevels: string
loggerLogLevels = apm.logger.addEnabled('info,debug')
loggerLogLevels = apm.logger.addEnabled(['info', 'debug'])
loggerLogLevels = apm.logger.removeEnabled('info,debug')
loggerLogLevels = apm.logger.removeEnabled(['info', 'debug'])

const loggerHas: boolean = apm.logger.has('level')

const newLogger = apm.logger.make('level')
const enabledNewLogger = apm.logger.make('level', true)

// *** EVENT

// @ts-expect-error
new apm.Event()

event.error = 'error'
event.error = new Error()

const eventTaskId: string = event.taskId
// @ts-expect-error
event.taskId = 'id'

const eventOpId: string = event.opId
// @ts-expect-error
event.opId = 'id'

event.set(kv)

const eventString: string = event.toString()

event.sendReport()
event.sendReport(kv)

lastEvent = apm.Event.last
apm.Event.last = event
apm.Event.last = undefined
apm.Event.last = null

// *** SPAN

// @ts-expect-error
span = new apm.Span()

span = apm.Span.makeEntrySpan('name', traceSettings, kv)
// @ts-expect-error
span = apm.Span.makeEntrySpan()

span = span.descend('name', kv)

const spanAsync: boolean = span.async
span.async = true
span.async = false

nil = span.run<null, void, [string, number]>((wrap) => {
    wrap((s: string, n: number) => {})
    return null
})
nil = span.run<null, void, [string, boolean]>((wrap) => {
    // @ts-expect-error
    wrap((s: string, n: number) => {})
    return null
})
// @ts-expect-error
nil = span.run((wrap) => {
    wrap((...args) => {})
})

nil = span.run(() => null)
// @ts-expect-error
nil = span.run(() => true)

pnil = span.runPromise(async () => null)
pnil = span.runPromise(() => Promise.resolve(null))
// @ts-expect-error
pnil = span.runPromise(async () => true)
// @ts-expect-error
span.runPromise(() => true)

span.enter()
span.enter(kv)

span.exit()
span.exit(kv)

span.exitCheckingError('error')
span.exitCheckingError(new Error())
span.exitCheckingError(new Error(), kv)

span.setExitError('error')
span.setExitError(new Error())

span.info(kv)

span.error('error')
span.error(new Error())

const spanTxName = span.getTransactionName()

lastSpan = apm.Span.last
apm.Span.last = span
apm.Span.last = null
apm.Span.last = undefined
