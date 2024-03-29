
### Table of Contents
[Migrating AppOptics => SolarWinds APM](#aotosw)<br>

<a name="aotosw"></a>

## appoptics-apm migration guide to solarwinds-apm

If you were using `appoptics-apm` out-of-the-box with **no** custom instrumentation and are migrating to a similar setup with `solarwinds-apm`, then follow the installation instructions for `solarwinds-apm`. Instrumentation should work as before (reporting to SolarWinds rather than AppOptics). You can stop reading now. Following applies only to migrating custom instrumentation.

### Background

There are two main changes to the API:

- Agent now supports W3C Trace Context propagation. Due to the implementation chosen, the `startOrContinueTrace` and `getTraceSettings` API functions now expect a `traceparent` and `tracestate` duo rather than a single `xtrace` value. This change will affect any custom instrumentation that uses the above mentioned API functions. The "tracestate" expected is in the format of spanId dash flags (e.g. `77771111aaaa0011-01`) and should either be taken from the `sw` vendor entry in the incoming `tracestate` header or set to `null` if none.

- Logging API has been simplified and adapted to match W3C Trace Context in logs. There are now two methods: `getTraceObjectForLog` and `getTraceStringForLog` they return either an object or a delimited string containing three values `trace_id`, `span_id` and `trace_flags`.

### Summary of changes

- The method `xtraceToEvent` has been renamed `traceToEvent`. It expects a string in the format of a `traceparent` rather than that of an `xtrace`.
- Function signature for `getTraceSettings` has changed. Function now accepts three arguments (traceparent, tracestate, options) rather than two (xtrace, options). Setting `tracestate` to null is valid.
- Function signature of `startOrContinueTrace` has changed. Function now accepts five arguments (traceparent, tracestate, build, run, opts, cb) rather than four (xtrace, build, run, opts, cb). Setting `tracestate` to null is valid.
- Function signature of `pStartOrContinueTrace` has changed. Function now accepts five arguments (traceparent, tracestate, build, run, opts, cb) rather than four (`xtrace`, build, run, opts, cb). Setting `tracestate` to null is valid.
- The method `getFormattedTraceId` has been removed. Similar functionality is provided by `getTraceStringForLog`.
- The method `insertLogObject` has been renamed `getTraceObjectForLog`.
- The config file name is now `solarwinds-apm-config`. It can still be either `.json` or `.js`.
- Global Object can be accessed via `global[Symbol.for('SolarWinds.Apm.Once')]`
