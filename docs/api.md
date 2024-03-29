## Classes

<dl>
<dt><a href="#apm">apm</a></dt>
<dd></dd>
<dt><a href="#Span">Span</a></dt>
<dd></dd>
<dt><a href="#Event">Event</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TraceSettings">TraceSettings</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#spanInfo">spanInfo</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#spanInfoFunction">spanInfoFunction</a> ⇒ <code><a href="#spanInfo">spanInfo</a></code></dt>
<dd></dd>
<dt><a href="#metric">metric</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SendMetricsReturn">SendMetricsReturn</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="apm"></a>

## apm
**Kind**: global class  

* [apm](#apm)
    * [.logLevel](#apm.logLevel)
    * [.loggers](#apm.loggers)
    * [.traceMode](#apm.traceMode)
    * [.tracing](#apm.tracing)
    * [.traceId](#apm.traceId)
    * [.logLevelAdd(levels)](#apm.logLevelAdd) ⇒ <code>string</code> \| <code>undefined</code>
    * [.logLevelRemove(levels)](#apm.logLevelRemove) ⇒ <code>string</code> \| <code>undefined</code>
    * [.backtrace()](#apm.backtrace) ⇒ <code>string</code>
    * [.bind(fn)](#apm.bind) ⇒ <code>function</code>
    * [.bindEmitter(em)](#apm.bindEmitter) ⇒ <code>EventEmitter</code>
    * [.setCustomTxNameFunction(probe, fn)](#apm.setCustomTxNameFunction) ⇒ <code>boolean</code>
    * [.readyToSample(ms, [obj])](#apm.readyToSample) ⇒ <code>boolean</code>
    * [.sampling(item)](#apm.sampling) ⇒ <code>boolean</code>
    * [.traceToEvent(traceparent)](#apm.traceToEvent) ⇒ <code>addon.Event</code> \| <code>undefined</code>
    * [.instrumentHttp(span, run, [options], res)](#apm.instrumentHttp) ⇒
    * [.instrument(span, run, [options], [callback])](#apm.instrument) ⇒ <code>value</code>
    * [.pInstrument(span, run, [options])](#apm.pInstrument) ⇒ <code>Promise</code>
    * [.startOrContinueTrace(traceparent, tracestate, span, runner, [opts], [callback])](#apm.startOrContinueTrace) ⇒ <code>value</code>
    * [.pStartOrContinueTrace(traceparent, tracestate, span, run, [opts])](#apm.pStartOrContinueTrace) ⇒ <code>Promise</code>
    * [.reportError(error)](#apm.reportError)
    * [.reportInfo(data)](#apm.reportInfo)
    * [.sendMetrics(metrics, [gopts])](#apm.sendMetrics) ⇒ [<code>SendMetricsReturn</code>](#SendMetricsReturn)
    * [.getTraceObjectForLog()](#apm.getTraceObjectForLog) ⇒ <code>object</code>
    * [.getTraceStringForLog([delimiter])](#apm.getTraceStringForLog) ⇒ <code>string</code>
    * [.wrapLambdaHandler([handler])](#apm.wrapLambdaHandler) ⇒ <code>function</code>

<a name="apm.logLevel"></a>

### apm.logLevel
**Kind**: static property of [<code>apm</code>](#apm)  
**Properties**

| Type | Description |
| --- | --- |
| <code>string</code> | comma separated list of log settings |

**Example** *(Sets the log settings)*  
```js
apm.logLevel = 'warn,error'
```
**Example** *(Get the log settings)*  
```js
var settings = apm.logLevel
```
<a name="apm.loggers"></a>

### apm.loggers
Expose debug logging global and create a function to turn
logging on/off.

**Kind**: static property of [<code>apm</code>](#apm)  
**Properties**

| Type | Description |
| --- | --- |
| <code>object</code> | the loggers available for use |

<a name="apm.traceMode"></a>

### apm.traceMode
Get and set the trace mode

**Kind**: static property of [<code>apm</code>](#apm)  
**Properties**

| Type | Description |
| --- | --- |
| <code>string</code> | the sample mode |

<a name="apm.tracing"></a>

### apm.tracing
Return whether or not the current code path is being traced.

**Kind**: static property of [<code>apm</code>](#apm)  
**Read only**: true  
**Properties**

| Type |
| --- |
| <code>boolean</code> | 

<a name="apm.traceId"></a>

### apm.traceId
Get X-Trace ID of the last event

**Kind**: static property of [<code>apm</code>](#apm)  
**Read only**: true  
**Properties**

| Type | Description |
| --- | --- |
| <code>string</code> | the trace ID as a string or undefined if not tracing. |

<a name="apm.logLevelAdd"></a>

### apm.logLevelAdd(levels) ⇒ <code>string</code> \| <code>undefined</code>
Add log levels to the existing set of log levels.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>string</code> \| <code>undefined</code> - - the current log levels or undefined if an error  

| Param | Type | Description |
| --- | --- | --- |
| levels | <code>string</code> | comma separated list of levels to add |

**Example**  
```js
apm.logLevelAdd('warn,debug')
```
<a name="apm.logLevelRemove"></a>

### apm.logLevelRemove(levels) ⇒ <code>string</code> \| <code>undefined</code>
Remove log levels from the current set.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>string</code> \| <code>undefined</code> - - log levels after removals or undefined if an
                             error.  

| Param | Type | Description |
| --- | --- | --- |
| levels | <code>string</code> | comma separated list of levels to remove |

**Example**  
```js
var previousLogLevel = apm.logLevel
apm.logLevelAdd('debug')
apm.logLevelRemove(previousLogLevel)
```
<a name="apm.backtrace"></a>

### apm.backtrace() ⇒ <code>string</code>
Generate a backtrace string

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>string</code> - the backtrace  
<a name="apm.bind"></a>

### apm.bind(fn) ⇒ <code>function</code>
Bind a function to the CLS context if tracing.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>function</code> - The bound function or the unmodified argument if it can't
  be bound.  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | The function to bind to the context |

<a name="apm.bindEmitter"></a>

### apm.bindEmitter(em) ⇒ <code>EventEmitter</code>
Bind an emitter if tracing

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>EventEmitter</code> - The bound emitter or the original emitter if an error.  

| Param | Type | Description |
| --- | --- | --- |
| em | <code>EventEmitter</code> | The emitter to bind to the trace context |

<a name="apm.setCustomTxNameFunction"></a>

### apm.setCustomTxNameFunction(probe, fn) ⇒ <code>boolean</code>
Set a custom transaction name function for a specific probe. This is
most commonly used when setting custom names for all or most routes.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>boolean</code> - true if successfully set else false  

| Param | Type | Description |
| --- | --- | --- |
| probe | <code>string</code> | The probe to set the function for |
| fn | <code>function</code> | A function that returns a string custom name or a                        falsey value indicating the default should be used.                        Pass a falsey value for the function to clear. |

**Example**  
```js
// custom transaction function signatures for supported probes:
express: customFunction (req, res)
hapi/hapi: customFunction (request)
```
<a name="apm.readyToSample"></a>

### apm.readyToSample(ms, [obj]) ⇒ <code>boolean</code>
Check whether the agent is ready to sample. It will wait up to
the specified number of milliseconds before returning.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>boolean</code> - - true if ready to sample; false if not  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>Number</code> | milliseconds to wait; default 0 means don't wait (poll). |
| [obj] | <code>Object</code> | if present obj.status will receive low level status |

<a name="apm.sampling"></a>

### apm.sampling(item) ⇒ <code>boolean</code>
Determine if the sample flag is set for the various forms of
 data.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>boolean</code> - - true if the sample flag is set else false.  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>string</code> \| [<code>Event</code>](#Event) \| <code>addon.Event</code> | the item to get the sampling flag of |

<a name="apm.traceToEvent"></a>

### apm.traceToEvent(traceparent) ⇒ <code>addon.Event</code> \| <code>undefined</code>
Convert an traceparent ID to an event containing the task ID and op ID.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>addon.Event</code> \| <code>undefined</code> - - addon.Event object
                                     containing an internal
                                     format of the traceparent
                                     if valid or undefined
                                     if not.  

| Param | Type | Description |
| --- | --- | --- |
| traceparent | <code>string</code> | traceparent ID |

<a name="apm.instrumentHttp"></a>

### apm.instrumentHttp(span, run, [options], res) ⇒
Instrument HTTP request/response

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: the value returned by the run function or undefined if it can't be run.  

| Param | Type | Description |
| --- | --- | --- |
| span | <code>string</code> \| [<code>spanInfoFunction</code>](#spanInfoFunction) | name or function returning spanInfo |
| run | <code>function</code> | code to instrument and run |
| [options] | <code>object</code> | options |
| [options.enabled] | <code>object</code> | enable tracing, on by default |
| [options.collectBacktraces] | <code>object</code> | collect backtraces |
| res | <code>HTTPResponse</code> | HTTP response to patch |

<a name="apm.instrument"></a>

### apm.instrument(span, run, [options], [callback]) ⇒ <code>value</code>
Apply custom instrumentation to a synchronous or async-callback function.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>value</code> - the value returned by the run function or undefined if it can't be run  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| span | <code>string</code> \| [<code>spanInfoFunction</code>](#spanInfoFunction) |  | span name or span-info function     If `span` is a string then a span is created with that name. If it     is a function it will be run only if tracing; it must return a     spanInfo-compatible object - see instrumenting-a-module.md in guides/. |
| run | <code>function</code> |  | the function to instrument<br/><br/>     Synchronous `run` function:<br/>     the signature has no callback, e.g., `function run () {...}`. If a     synchronous `run` function throws an error agent will report that     error for the span and re-throw the error.<br/>     <br/>     Asynchronous `run` function:<br/>     the signature must include a done callback that is used to let     agent know when your instrumented async code is done running,     e.g., `function run (done) {...}`. In order to report an error for     an async span the done function must be called with an Error object     as the argument. |
| [options] | <code>object</code> |  | options |
| [options.enabled] | <code>boolean</code> | <code>true</code> | enable tracing |
| [options.collectBacktraces] | <code>boolean</code> | <code>false</code> | collect stack traces. |
| [callback] | <code>function</code> |  | optional callback, if async |

**Example**  
```js
//
// A synchronous `run` function.
//
//   If the run function is synchronous the signature does not include
//   a callback, e.g., `function run () {...}`.
//

function spanInfo () {
  return {name: 'custom', kvpairs: {Foo: 'bar'}}
}

function run () {
  const contents = fs.readFileSync('some-file', 'utf8')
  // do things with contents
}

apm.instrument(spanInfo, run)
```
**Example**  
```js
//
// An asynchronous `run` function.
//
// Rather than callback directly, you give the done argument.
// This tells the agent when your instrumented code is done running.
//
// The `callback` function is the callback you normally would have given
// directly to the code you want to instrument. It receives the same
// arguments as were received by the `done` callback for the `run` function
// and the same `this` context is also applied to it.

function spanInfo () {
  return {name: 'custom', {Foo: 'bar'}}
}

function run (done) {
  fs.readFile('some-file', done)
}

function callback (err, data) {
  console.log('file contents are: ' + data)
}

apm.instrument(spanInfo, run, callback)
```
<a name="apm.pInstrument"></a>

### apm.pInstrument(span, run, [options]) ⇒ <code>Promise</code>
Apply custom instrumentation to a promise-returning asynchronous function.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>Promise</code> - the value returned by the run function or undefined if it can't be run  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| span | <code>string</code> \| [<code>spanInfoFunction</code>](#spanInfoFunction) |  | span name or span-info function     If `span` is a string then a span is created with that name. If it     is a function it will be run only if tracing; it must return a     spanInfo-compatible object - see instrumenting-a-module.md in guides/. |
| run | <code>function</code> |  | the function to instrument<br/><br/>     This function must return a promise. |
| [options] | <code>object</code> |  | options |
| [options.enabled] | <code>boolean</code> | <code>true</code> | enable tracing |
| [options.collectBacktraces] | <code>boolean</code> | <code>false</code> | collect stack traces. |

**Example**  
```js
//
// A synchronous `run` function.
//
//   If the run function is synchronous the signature does not include
//   a callback, e.g., `function run () {...}`.
//

function spanInfo () {
  return {name: 'custom', kvpairs: {Foo: 'bar'}}
}

function run () {
  return axios.get('https://google.com').then(r => {
    ...
    return r;
  })
}

apm.pInstrument(spanInfo, run).then(...)
```
<a name="apm.startOrContinueTrace"></a>

### apm.startOrContinueTrace(traceparent, tracestate, span, runner, [opts], [callback]) ⇒ <code>value</code>
Start or continue a trace. Continue is in the sense of continuing a
trace based on an X-Trace ID received from an external source, e.g.,
HTTP headers or message queue headers.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>value</code> - the value returned by the run function or undefined if it can't be run  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| traceparent | <code>string</code> |  | traceparent ID to continue from or null |
| tracestate | <code>string</code> |  | tracestate ID to continue from or null |
| span | <code>string</code> \| [<code>spanInfoFunction</code>](#spanInfoFunction) |  | name or function returning spanInfo |
| runner | <code>function</code> |  | run this function. sync if no arguments, async if one. |
| [opts] | <code>object</code> |  | options |
| [opts.enabled] | <code>boolean</code> | <code>true</code> | enable tracing |
| [opts.collectBacktraces] | <code>boolean</code> | <code>false</code> | collect backtraces |
| [opts.forceNewTrace] | <code>boolean</code> | <code>false</code> | force a new trace, ignoring any existing context (but not traceparent) |
| [opts.customTxName] | <code>string</code> \| <code>function</code> |  | name or function |
| [callback] | <code>function</code> |  | this is supplied as the callback if runner is async. |

**Example**  
```js
apm.startOrContinueTrace(
  null,
  'sync-span-name',
  functionToRun,           // synchronous so function takes no arguments
  {customTxName: 'special-span-name'}
)
```
**Example**  
```js
apm.startOrContinueTrace(
  null,
  'sync-span-name',
  functionToRun,
  // note - no context is provided for the customTxName function. If
  // context is required the caller should wrap the function in a closure.
  {customTxName: customNameFunction}
)
```
**Example**  
```js
// this is the function that should be instrumented
request('https://www.google.com', function realCallback (err, res, body) {...})
// because asyncFunctionToRun only accepts one parameter it must be
// wrapped, so the function to run becomes
function asyncFunctionToRun (cb) {
  request('https://www.google.com', cb)
}
// and realCallback is supplied as the optional callback parameter

apm.startOrContinueTrace(
  null,
  'async-span-name',
  asyncFunctionToRun,     // async, so function takes one argument
  // no options this time
  realCallback            // receives request's callback arguments.
)
```
<a name="apm.pStartOrContinueTrace"></a>

### apm.pStartOrContinueTrace(traceparent, tracestate, span, run, [opts]) ⇒ <code>Promise</code>
Start or continue a trace running a function that returns a promise. Continue is in
the sense of continuing a trace based on an X-Trace ID received from an external
source, e.g., HTTP headers or message queue headers.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>Promise</code> - the value returned by the run function or undefined if it can't be run  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| traceparent | <code>string</code> |  | traceparent ID to continue from or null |
| tracestate | <code>string</code> |  | tracestate ID to continue from or null |
| span | <code>string</code> \| [<code>spanInfoFunction</code>](#spanInfoFunction) |  | name or function returning spanInfo |
| run | <code>function</code> |  | the promise-returning function to instrument |
| [opts] | <code>object</code> |  | options |
| [opts.enabled] | <code>boolean</code> | <code>true</code> | enable tracing |
| [opts.collectBacktraces] | <code>boolean</code> | <code>false</code> | collect backtraces |
| [opts.forceNewTrace] | <code>boolean</code> | <code>false</code> | ignore any existing context and force a new trace |
| [opts.customTxName] | <code>string</code> \| <code>function</code> |  | name or function |

**Example**  
```js
function spanInfo () {
  return {name: 'custom', kvpairs: {Foo: 'bar'}}
}

// axios returns a promise
function functionToRun () {
  return axios.get('https://google.com').then(r => {
    ...
    return r;
  })
}

apm.pStartOrContinueTrace(
  null,
  spanInfo,
  functionToRun,
).then(...)
```
<a name="apm.reportError"></a>

### apm.reportError(error)
Report an error event in the current trace.

**Kind**: static method of [<code>apm</code>](#apm)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error instance to report |

<a name="apm.reportInfo"></a>

### apm.reportInfo(data)
Report an info event in the current trace.

**Kind**: static method of [<code>apm</code>](#apm)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Data to report in the info event |

<a name="apm.sendMetrics"></a>

### apm.sendMetrics(metrics, [gopts]) ⇒ [<code>SendMetricsReturn</code>](#SendMetricsReturn)
Send custom metrics. There are two types of metrics:
1) count-based - the number of times something has occurred (no
                 value is associated with this type)
2) value-based - a specific value (or sum of values if count > 1).

The metrics submitted are aggregated by metric name and tag(s), then
sent every 60 seconds.

**Kind**: static method of [<code>apm</code>](#apm)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metrics | [<code>metric</code>](#metric) \| [<code>Array.&lt;metric&gt;</code>](#metric) |  | a metric or an array of metrics |
| [gopts] | <code>object</code> |  | supply defaults to be applied to each metric. |
| [gopts.addHostTag] | <code>boolean</code> | <code>false</code> | add a hostname tag |
| [gopts.tags] | <code>object</code> |  | tags to add to each metric. the tags are     added as "metric.tags = Object.assign({}, gopts.tags, metric.tags)" |

**Example**  
```js
// send a single metric
apm.sendMetrics({name: 'my.counts.basic'});
apm.sendMetrics({name: 'my.values.some', value: 42.42});

// send multiple metrics (most efficient)
apm.sendMetrics([
  // default count is 1
  {name: 'my.counts.defaulted'},
  {name: 'my.counts.multiple', count: 3},
  {name: 'my.values.xyzzy', value: 10},
  // report two values for which the sum is 25.
  {name: 'my.values.xyzzy', count: 2, value: 25}
]);

// add tags that can be used for filtering on the host
apm.sendMetrics([
  {name: 'my.metric.end-of-file', tags: {class: 'error', subsystem: 'fs'}}
]);

// add a hostname tag automatically.
apm.sendMetrics([
  {name: 'my.metric.end-of-file', tags: {class: 'error'}, addHostTag: true}
]);

// add a hostname tag and an application tag to each metric.
apm.sendMetrics(
  [
    {name: 'my.metric', tags: {class: 'status'}},
    {name: 'my.time', value: 33.3, tags: {class: 'performance'}}
   ],
  {addHostTag: true, tags: {application: 'x'}}
);

// default class to 'status' for metrics that don't supply a class
// tag.
apm.sendMetrics(
  [
    {name: 'my.metric'},
    {name: 'my.time', value: 33.3, tags: {class: 'performance'}}
  ],
  {tags: {class: 'status'}}
);
```
<a name="apm.getTraceObjectForLog"></a>

### apm.getTraceObjectForLog() ⇒ <code>object</code>
Return an object representation of the trace containing trace_id, span_id, trace_flags. The primary intended use for this is
to insert custom tokens in log packages.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>object</code> - - the trace log  object (e.g. { trace_id:..., span_id: ..., trace_flages: ...})  
**Example**  
```js
log4js.addLayout('json', function (config) {
  return function (logEvent) {
    logEvent.context = { ...logEvent.context, ...apm.getTraceObjectForLog() }
    return JSON.stringify(logEvent)
  }
})
log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: { type: 'json' } }
  },
  categories: {
    default: { appenders: ['out'], level: 'info' }
  }
})
const logger = log4js.getLogger()
logger.info('doing something.')
```
<a name="apm.getTraceStringForLog"></a>

### apm.getTraceStringForLog([delimiter]) ⇒ <code>string</code>
Return text delimited representation of the trace containing trace_id, span_id, trace_flags. The primary intended use for this is
to insert custom tokens in log packages.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>string</code> - - the trace log string (e.g. trace_id:... span_id: ..., trace_flages: ...)  

| Param | Type | Description |
| --- | --- | --- |
| [delimiter] | <code>string</code> | the delimiter to use |

**Example**  
```js
log4js.configure({
  appenders: {
    out: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%d %p %c %x{user} says: %m is: %x{trace} %n',
        tokens: {
          user: function (logEvent) {
            return 'Jake'
          },
          trace: function () {
            return typeof apm !=='undefined' ? apm.getTraceStringForLog() : ''
          }
        }
      }
    }
  },
  categories: { default: { appenders: ['out'], level: 'info' } }
})
const logger = log4js.getLogger()
logger.info('token from api')
```
<a name="apm.wrapLambdaHandler"></a>

### apm.wrapLambdaHandler([handler]) ⇒ <code>function</code>
Wrap the lambda handler function so it can be traced by AppOptics APM.

**Kind**: static method of [<code>apm</code>](#apm)  
**Returns**: <code>function</code> - - an async function, wrapping handler, to be used
                      instead of handler.  

| Param | Type | Description |
| --- | --- | --- |
| [handler] | <code>function</code> | wraps your lambda handler function so it                               is instrumented. your handler must return                               a promise, be a JavaScript async function,                               or implement the callback signature. |

**Example**  
```js
const apm = require('appoptics-apm');

const wrappedHandler = apm.wrapLambdaHandler(myHandler);

async function myHandler (event, context) {
  // implementation
  // ...
}

// set the handler to the wrapped function.
exports.handler = wrappedHandler;
```
**Example**  
```js
const apm = require('appoptics-apm');

const wrappedHandler = apm.wrapLambdaHandler(myHandler);

function myHandler (event, context, callback) {
  // implementation
  // ...
  if (error) {
    callback(error);
  }

  callback(null, result);
}
```
<a name="Span"></a>

## Span
**Kind**: global class  

* [Span](#Span)
    * [new Span(name, settings, [data])](#new_Span_new)
    * _instance_
        * [.descend(name, data)](#Span+descend) ⇒ [<code>Span</code>](#Span)
        * [.run(fn)](#Span+run) ⇒
        * [.runPromise(fn, [opts])](#Span+runPromise) ⇒
        * [.runAsync(fn)](#Span+runAsync) ⇒
        * [.runSync(fn)](#Span+runSync) ⇒
        * [.enter(data)](#Span+enter)
        * [.exit(data)](#Span+exit)
        * [.exitCheckingError(err, data)](#Span+exitCheckingError)
        * [.setExitError(err)](#Span+setExitError)
        * [.info(data)](#Span+info)
        * [.error(data)](#Span+error)
    * _static_
        * [.makeEntrySpan(name, settings, kvpairs)](#Span.makeEntrySpan)

<a name="new_Span_new"></a>

### new Span(name, settings, [data])
Create an execution span.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Span name |
| settings | <code>object</code> |  | Settings returned from getTraceSettings() |
| [settings.traceTaskId] | [<code>Event</code>](#Event) |  | an addon.Event instance to create the events from.     Events will have the same task ID and sample bit but unique op IDs. This value is set     by getTraceSettings() and must be present. |
| [settings.edge] | <code>boolean</code> | <code>true</code> | the entry event of this span should edge back to the     op id associated with settings.traceTaskId. The only time this is not true is when the     span being created is a new top level span not being continued from an inbound X-Trace     ID. This must be set explicitly to a falsey value; it's absence is true. |
| [data] | <code>object</code> |  | Key/Value pairs of info to add to event |

**Example**  
```js
var span = new Span('fs', apm.lastEvent, {
  File: file
})
```
<a name="Span+descend"></a>

### span.descend(name, data) ⇒ [<code>Span</code>](#Span)
Create a new span descending from the current span

**Kind**: instance method of [<code>Span</code>](#Span)  
**Returns**: [<code>Span</code>](#Span) - the created span  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Span name |
| data | <code>object</code> | Key/Value pairs of info to add to the entry event |

**Example**  
```js
var inner = outer.descend('fs', {
  File: file
})
```
<a name="Span+run"></a>

### span.run(fn) ⇒
Run a function within the context of this span. Similar to mocha, this
identifies asynchronicity by function arity and invokes runSync or runAsync

**Kind**: instance method of [<code>Span</code>](#Span)  
**Returns**: the value returned by fn()  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | function to run within the span context |

**Example**  
```js
span.run(function () {
  syncCallToTrace()
})
```
**Example**  
```js
span.run(function (wrap) {
  asyncCallToTrace(wrap(callback))
})
```
<a name="Span+runPromise"></a>

### span.runPromise(fn, [opts]) ⇒
Run a promise-returning function within the context of this span. It
will throw an exception if the function's return value does not have
.then and .catch methods.

**Kind**: instance method of [<code>Span</code>](#Span)  
**Returns**: the value returned by fn()  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | the promise-returning function to run within the span context |
| [opts] | <code>object</code> |  | an options object |
| [opts.collectBacktraces] | <code>boolean</code> | <code>false</code> | add a backtrace KV to the span |

**Example**  
```js
span.runPromise(async function () {
  return axios.get('https://google.com');
});
```
<a name="Span+runAsync"></a>

### span.runAsync(fn) ⇒
Run an async function within the context of this span.

**Kind**: instance method of [<code>Span</code>](#Span)  
**Returns**: the value returned by fn()  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | async function to run within the span context |

**Example**  
```js
span.runAsync(function (wrap) {
  asyncCallToTrace(wrap(callback))
})
```
<a name="Span+runSync"></a>

### span.runSync(fn) ⇒
Run a sync function within the context of this span.

**Kind**: instance method of [<code>Span</code>](#Span)  
**Returns**: the value returned by fn()  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | sync function to run withing the span context |

**Example**  
```js
span.runSync(function () {
  syncCallToTrace()
})
```
<a name="Span+enter"></a>

### span.enter(data)
Send the enter event

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Key/Value pairs of info to add to event |

**Example**  
```js
span.enter()
syncCallToTrace()
span.exit()
```
**Example**  
```js
// If using enter/exit to trace async calls, you must flag it as async
// manually and bind the callback to maintain the trace context
span.async = true
span.enter()
asyncCallToTrace(apm.bind(function (err, res) {
  span.exit()
  callback(err, res)
}))
```
<a name="Span+exit"></a>

### span.exit(data)
Send the exit event

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | key-value pairs of info to add to event |

<a name="Span+exitCheckingError"></a>

### span.exitCheckingError(err, data)
Send the exit event with an error status

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Error to add to event |
| data | <code>object</code> | Key/Value pairs of info to add to event |

<a name="Span+setExitError"></a>

### span.setExitError(err)
Set an error to be sent with the exit event

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Error to add to event |

<a name="Span+info"></a>

### span.info(data)
Create and send an info event

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | key-value pairs to add to event |

**Example**  
```js
span.info({Foo: 'bar'})
```
<a name="Span+error"></a>

### span.error(data)
Create and send an error event

**Kind**: instance method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Key/Value pairs to add to event |

**Example**  
```js
span.error(error)
```
<a name="Span.makeEntrySpan"></a>

### Span.makeEntrySpan(name, settings, kvpairs)
Create a new entry span. An entry span is the top span in a new trace in
this process. It might be continued from another process, e.g., an X-Trace-ID
header was attached to an inbound HTTP/HTTPS request.

**Kind**: static method of [<code>Span</code>](#Span)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the name for the span. |
| settings | <code>object</code> | the object returned by apm.getTraceSettings() |
| kvpairs | <code>object</code> | key/value pairs to be added to the entry event |

<a name="Event"></a>

## Event
**Kind**: global class  

* [Event](#Event)
    * [new Event(span, label, parent, edge)](#new_Event_new)
    * [.set(data)](#Event+set)
    * [.enter()](#Event+enter)
    * [.toString()](#Event+toString)
    * [.sendReport(data)](#Event+sendReport)

<a name="new_Event_new"></a>

### new Event(span, label, parent, edge)
Create an event


| Param | Type | Description |
| --- | --- | --- |
| span | <code>string</code> | name of the event's span |
| label | <code>string</code> | Event label (usually entry or exit) |
| parent | <code>apmb.Event</code> | supplies the taskId to construct the event from. |
| edge | <code>boolean</code> | This should edge back to the parent |

<a name="Event+set"></a>

### event.set(data)
Set key-value pairs on this event

**Kind**: instance method of [<code>Event</code>](#Event)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Key/Value pairs of info to add to event |

<a name="Event+enter"></a>

### event.enter()
Enter the context of this event

**Kind**: instance method of [<code>Event</code>](#Event)  
<a name="Event+toString"></a>

### event.toString()
Get the X-Trace ID string of the event

**Kind**: instance method of [<code>Event</code>](#Event)  
<a name="Event+sendReport"></a>

### event.sendReport(data)
Send this event to the reporter

**Kind**: instance method of [<code>Event</code>](#Event)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | additional key-value pairs to send |

<a name="TraceSettings"></a>

## TraceSettings : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| doSample | <code>boolean</code> | the sample decision |
| doMetrics | <code>boolean</code> | the metrics decision |
| traceTaskId | [<code>Event</code>](#Event) | the parent event to get task id from |
| edge | <code>boolean</code> | true to edge back to parent op id |
| source | <code>number</code> | the sample decision source |
| rate | <code>number</code> | the sample rate used |
| mode | <code>number</code> | local mode to use for decision |
| ttRequested | <code>boolean</code> | trigger trace requested |
| ttOptions | <code>string</code> | X-Trace-Options header value |
| ttSignature | <code>string</code> | X-Trace-Options-Signature header value |
| ttTimestamp | <code>integer</code> | UNIX timestamp value from X-Trace-Options |

<a name="spanInfo"></a>

## spanInfo : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the name for the span |
| [kvpairs] | <code>object</code> | kvpairs to add to the span |
| [finalize] | <code>function</code> | callback receiving created span |

<a name="spanInfoFunction"></a>

## spanInfoFunction ⇒ [<code>spanInfo</code>](#spanInfo)
**Kind**: global typedef  
<a name="metric"></a>

## metric : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | name of the metric |
| [count] | <code>integer</code> | <code>1</code> | count of the metric |
| [value] | <code>number</code> |  | if summary, value or sum of values |
| [addHostTag] | <code>boolean</code> | <code>false</code> | add a hostname tag |
| [tags] | <code>object</code> |  | key-value pairs that can be used for filtering |
| [testing] | <code>boolean</code> | <code>false</code> | return array of correct metrics in addition     to an array of metrics with errors. |
| [noop] | <code>boolean</code> | <code>false</code> | do not actually send the metrics to the collector |

<a name="SendMetricsReturn"></a>

## SendMetricsReturn : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| errors | <code>array</code> | an array of metrics for which an error occurred |
| [correct] | <code>array</code> | if globalOption.testing specified the correctly                               processed metrics are returned in this array. |

