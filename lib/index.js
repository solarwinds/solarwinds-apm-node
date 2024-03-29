'use strict'

// create or get this symbol.
const apmOnce = Symbol.for('solarwinds-apm')

// remember these before we've required any files so a warning can be issued if needed.
// filter out this file and the script entry script loaded when the Node.js process launched,
const alreadyLoaded = Object.keys(require.cache).filter(f => f !== __filename && f !== require.main.filename)

// if this symbol is in the global registry then set exports
// to the value cached there. Otherwise set a global property
// to exports (the bottom of the file in the else). This exists
// to prevent problems with the request package which uses
// stealthy-require to brute force multiple instantiations.
if (global[apmOnce]) {
  module.exports = global[apmOnce]
  module.exports.loggers.warn('solarwinds-apm is being executed more than once')
} else {
/* eslint-disable indent */
// disable eslint's indent so it doesn't complain because everything in the else
// (all of the file when it's required the first time) isn't indented.

// make global context object with noop testing function. apm.g.testing() is
// setup differently for tests but this allows a single test to run without
// error.

const apm = exports

// global place to store stats. each module should create a separate
// namespace for its stats. e.g., apm._stats.span = {...}
apm._stats = {}

apm.version = require('../package.json').version

apm.g = {
  testing: function (filename) {
    apm.g.current = filename
  },
  taskDict: {}
}

/**
 * @class apm
 *
 * @example
 * The name apm can be any name you choose. Just require
 * solarwinds-apm. In this document apm is used.
 *
 * const apm = require('solarwinds-apm')
 */

// first, set up logging so problems can be reported.
const path = require('path')
const env = process.env

apm.root = path.resolve(__dirname, '..')

// don't insert traceparent/tracestate into outbound http request headers when this property is truthy.
apm.omitTraceId = Symbol('apm.omitTraceId')

const { logger, loggers } = require('./loggers')
apm.logger = logger
const log = apm.loggers = loggers

/**
 * @name apm.logLevel
 * @property {string} - comma separated list of log settings
 * @example <caption>Sets the log settings</caption>
 * apm.logLevel = 'warn,error'
 * @example <caption>Get the log settings</caption>
 * var settings = apm.logLevel
 */
Object.defineProperty(apm, 'logLevel', {
  get () { return logger.logLevel },
  set (value) { logger.logLevel = value }
})

/**
 * Add log levels to the existing set of log levels.
 *
 * @method apm.logLevelAdd
 * @param {string} levels - comma separated list of levels to add
 * @return {string|undefined} - the current log levels or undefined if an error
 *
 * @example
 * apm.logLevelAdd('warn,debug')
 */
apm.logLevelAdd = logger.addEnabled.bind(logger)

/**
 * Remove log levels from the current set.
 *
 * @method apm.logLevelRemove
 * @param {string} levels - comma separated list of levels to remove
 * @return {string|undefined} - log levels after removals or undefined if an
 *                              error.
 * @example
 * var previousLogLevel = apm.logLevel
 * apm.logLevelAdd('debug')
 * apm.logLevelRemove(previousLogLevel)
 */
apm.logLevelRemove = logger.removeEnabled.bind(logger)

// read the config file so that if it disables the agent it's possible to
// skip loading the bindings.
const uc = (require('./get-unified-config'))()

if (uc.unusedConfig.length) {
  log.warn(`properties in ${uc.file} that were not recognized: ${uc.unusedConfig.join(', ')}`)
}
if (uc.unusedEnvVars.length) {
  log.warn(`environment variables not recognized: ${uc.unusedEnvVars.join(', ')}`)
}
if (uc.unusedProbes.length) {
  log.warn(`config file probes not recognized: ${uc.unusedProbes.join(', ')}`)
}
// if there were fatal errors the agent must be disabled.
let enabled = uc.fatals.length === 0
for (let i = 0; i < uc.fatals.length; i++) {
  log.error(uc.fatals[i])
}
for (let i = 0; i < uc.errors.length; i++) {
  log.error(uc.errors[i])
}
for (let i = 0; i < uc.warnings.length; i++) {
  log.warn(uc.warnings[i])
}
for (let i = 0; i < uc.debuggings.length; i++) {
  log.debug(uc.debuggings[i])
}
for (let i = 0; i < uc.settingsErrors.length; i++) {
  log.error(uc.settingsErrors[i])
}

//
// put in their historical variables.
//
apm.probes = uc.probes
apm.specialUrls = uc.transactionSettings && uc.transactionSettings.filter(s => s.type === 'url')
apm.execEnv = uc.execEnv
const config = uc.global
apm.cfg = Object.assign({}, config)

// now that the config is known warn about files already being required if this is not development environment.
if (alreadyLoaded.length && apm.execEnv.nodeEnv !== 'development') {
  log.warn('the following files were loaded before solarwinds-apm:', alreadyLoaded)
}

//
// there isn't really a better place to put this
// it takes an http request object argument.
//
apm.getDomainPrefix = function (req) {
  const h = req.headers
  const s = req.socket || { localPort: 80 }
  let prefix = (h && h['x-forwarded-host']) || h.host || ''
  const parts = prefix.split(':')
  // if the port is included in the header then use it
  if (parts.length === 2 && parts[1]) {
    return prefix
  }
  // use the first part (strips off ':' with nothing after)
  prefix = parts[0]
  if (s.localPort !== 80 && s.localPort !== 443 && prefix !== '') {
    prefix = prefix + ':' + s.localPort
  }
  return prefix
}

//
// Utility function to create function that issues consistently formatted
// messages for patching errors.
//
apm.makeLogMissing = function makeLogMissing (name) {
  const s = `probes.${name} "%s" not found`
  return function logMissing (missing) {
    log.patching(s, missing)
  }
}

//
// now go through a sequence of checks and tests that can result in
// solarwinds apm being disabled. accumulate the errors so a summary message
// with the enabled status can be output at the end of the checks.
//
enabled = enabled && config.enabled
const errors = []

const disabledByConfig = 'configuration'
if (!enabled) {
  errors.push(disabledByConfig)
}

// if the serviceKey is not valid then the agent cannot be enabled unless
// running in AWS lambda.
if (apm.execEnv.type !== 'serverless' || apm.execEnv.id !== 'lambda') {
  enabled = enabled && config.serviceKey
}

//
// map valid modes to oboe values for an easy way to validate/convert. They are defined
// here so they can be used when processing the config file.
//
Object.defineProperty(apm, 'modeMap', {
  get () {
    return { 0: 0, 1: 1, never: 0, always: 1, disabled: 0, enabled: 1 }
  }
})

Object.defineProperty(apm, 'modeToStringMap', {
  get () {
    return { 0: 'disabled', 1: 'enabled' }
  }
})

//
// Load context provider
//
try {
  apm.cls = require('ace-context')
} catch (e) {
  enabled = false
  log.error('Can\'t load %s', apm.contextProvider, e.stack)
  errors.push('context provider not loaded')
}

//
// Try to load bindings if not disabled. Handle failure or disabled
// gracefully.
//
let bindings

if (enabled && !env.SW_APM_TEST_NO_BINDINGS) {
  try {
    bindings = require('solarwinds-apm-bindings')
  } catch (e) {
    const args = ['Can\'t load bindings']
    if (e.code !== 'MODULE_NOT_FOUND') {
      args.push(e.stack)
    }
    log.error.apply(log, args)
    errors.push(`require failed: ${e.code ? e.code : ''}`)
  }
} else {
  let msg
  if (errors.length) {
    if (errors.indexOf(disabledByConfig) === -1) {
      msg = 'solarwinds-bindings not loaded due to previous errors'
    }
  } else {
    msg = `solarwinds-bindings not loaded by ${enabled ? 'env' : 'config'}`
  }
  if (msg) {
    log.debug(msg)
    errors.push(msg)
  }
}

// whether because explicitly disabled or an error get the essentials
if (!bindings) {
  enabled = false
  bindings = require('./addon-sim')
}
apm.addon = bindings

//
// issue a summary error message if the agent is disabled.
//
if (!enabled) {
  if (errors.length && errors[0] === 'disabled by config file') {
    log.debug(`${errors[0]}: ${uc.file}`)
  } else {
    log.error('solarwinds-apm disabled due to: %s', errors.join(', '))
  }
}

// this is not a class in bindings v6. addon-sim will provide
// skeleton functions if bindings is not available.
apm.reporter = bindings.Reporter

// set up a debugging logging controller for specific places
apm.control = { logging: {} }

// don't issue errors for what are normal situations at startup.
let startup = true
Object.defineProperty(apm, 'startup', {
  get () {
    return startup
  },
  set (value) {
    startup = value
  }
})

/**
 * Expose debug logging global and create a function to turn
 * logging on/off.
 *
 * @name apm.loggers
 * @property {object} - the loggers available for use
 */
apm.debugLogging = function (setting) {
  log.enabled = setting
}

// give a quick update
const x = enabled ? '' : '(disabled)'
log.debug(
  `apm ${apm.version}${x}, bindings ${bindings?.version ?? 'version unknown'}, oboe ${bindings?.Config?.getVersionString() ?? 'version unknown'}`
)

//
// bring in the api or simulated api. it needs access to apm.
//
const api = require(enabled ? './api' : './api-sim')(apm)

for (const k of Object.keys(api)) {
  if (k in apm) {
    log.error(`api key ${k} conflicts, skipping`)
  } else {
    apm[k] = api[k]
  }
}

apm.Event.init(apm)
apm.Span.init(apm)

if (config.traceMode === 0) {
  log.debug('tracing disabled by config')
}

//
// now that the api is loaded the trace mode can be set
//
apm.traceMode = apm.cfg.traceMode

// and make enabled reflect the final decision
apm.cfg.enabled = !!enabled

//
// the rest of the code is only relevant if bindings are loaded.
//
if (enabled) {
  const options = Object.assign({}, apm.cfg)
  if (apm.execEnv.type !== 'serverless' || apm.execEnv.id !== 'lambda') {
    delete options.sampleRate
  }

  // replace the serviceKey with our cleansed service key. the agent
  // will be disabled if the service key doesn't at least look valid.
  // options.serviceKey = cleansedKey;

  //
  // initialize liboboe.
  //
  const status = bindings.oboeInit(options)

  // make sure things are in sync for the lambda environment
  if (apm.execEnv.id === 'lambda') {
    if (bindings.Reporter.getType() !== 'lambda') {
      log.error(`execution environment mismatch ${apm.execEnv.id} vs. ${bindings.Reporter.getType()}`)
    }
    let av = 'n/a'
    try {
      const p = require('appoptics-auto-lambda/package.json')
      if ('version' in p) av = p.version
    } catch (e) {}

    let previous
    // if info is not enabled enable it for long enough to output the versions
    if (!apm.logger.has('info')) {
      previous = apm.logLevel
      apm.logLevelAdd('info')
    }
    const x = enabled ? '' : '(disabled)'
    const apmv = apm.version
    const abv = bindings.version
    const clv = bindings.Config.getVersionString()
    apm.loggers.info(`apm ${apmv}${x}, bindings ${abv}, oboe ${clv}, auto ${av}`)
    if (previous) {
      apm.logLevel = previous
    }
  }

  if (apm.cfg.sampleRate !== undefined) {
    apm.sampleRate = apm.cfg.sampleRate
  }

  if (status > 0) {
    log.error(`failed to initialize, error: ${status}`)
  }

  apm.fs = require('fs')

  //
  // Collect module data before patching fs
  //
  const base = path.join(process.cwd(), 'node_modules')
  let modules
  try {
    modules = apm.fs.readdirSync(base)
  } catch (e) {}
  delete apm.fs

  const moduleData = {}
  if (Array.isArray(modules)) {
    modules.forEach(mod => {
      if (mod === '.bin' || mod[0] === '@') return
      try {
        const pkg = require(`${base}/${mod}/package.json`)
        moduleData[`Node.${pkg.name}.Version`] = pkg.version
      } catch (e) {}
    })
  }

  //
  // Enable require monkey-patcher
  //
  if (enabled) {
    // patching registers all probes
    const patcher = require('./require-patch')
    // de-register those probes that have a registered property been specifically set to false
    Object.keys(apm.probes).filter(prob => apm.probes[prob].registered === false).forEach(probe => patcher.deregister(probe))
    patcher.enable()
  }

  //
  // start metrics and send __Init event
  //
  process.nextTick(function () {
    if (enabled) {
      if (config.runtimeMetrics) {
        if (apm.execEnv.type !== 'serverless' || apm.execEnv.id !== 'lambda') {
          apm.loggers.debug('starting runtimeMetrics')
          apm.metrics = new apm.Metrics()
          apm.metrics.start()
        } else {
          apm.loggers.debug('config.runtimeMetrics overridden by lambda environment')
        }
      }

      apm.requestStore.run(function () {
        const v = process.versions
        const data = {
          __Init: true,
          Layer: 'nodejs',
          Label: 'single',

          'APM.Version': apm.version,
          'APM.Extension.Version': bindings.Config.getVersionString(),
          'process.telemetry.path': __dirname,

          'telemetry.sdk.language': 'nodejs',
          'process.runtime.name': 'nodejs',
          'process.runtime.version': v.node,
          'process.runtime.description': `Node.js ${v.node}`,
          'process.executable.path': process.execPath,
          'process.command_line': process.argv.join(' '),
          'host.arch': process.arch,
          'os.type': process.platform,

          ...moduleData,
          'Node.V8.Version': v.v8,
          'Node.LibUV.Version': v.uv,
          'Node.OpenSSL.Version': v.openssl,
          'Node.Ares.Version': v.ares,
          'Node.ZLib.Version': v.zlib,
          'Node.HTTPParser.Version': v.llhttp || v.http_parser,
        }

        log.info('making nodejs:single event')
        const md = bindings.Event.makeRandom(1)
        const e = new apm.Event('nodejs', 'single', md)

        const status = e.sendStatus(data)
        if (status < 0) {
          log.error(`init.sendStatus() failed (${status})`)
        } else {
          log.info('init.sendStatus() succeeded')
        }
      })

      startup = false
      log.info('startup completed')
    }
  })

// this is the end of the bindings enabled check
}

// this is the end of the unindented check around whether the
// file has already been loaded.
//
// cache the exports in our own global so they can be reused
// if a package like "stealthy-require" clears node's require
// cache.
global[apmOnce] = apm
}
