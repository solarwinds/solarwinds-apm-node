/* global it, describe */
'use strict'

const fs = require('fs')

// Note: the following script was in the root of the project as "prepack.js"
// As such it was interfering with git installs.
// Since it functions as an "integrity test" it was passed to the test directory
// converted into two tests and left as much possible as-is (for now).

const expect = require('chai').expect

describe('integrity', function () {
  it('should make sure api-sim supplies all the functions in api', function () {
    let errorCount = 0
    //
    // make sure api-sim supplies all the functions in api. this doesn't verify that
    // all functions operate in a compatible way. that can be added over time if errors
    // turn out to be a problem.
    //
    const skeletalAo = {
      loggers: {
        addGroup () {},
        Debounce: function () {
          return {
            log: function () {}
          }
        }
      },
      logger: {
        addEnabled () {}
      },
      execEnv: { type: 'linux', id: undefined, nodeEnv: 'production' }
    }

    // can't require ../lib/api due to cyclic dependencies.
    // load all and filter out keys that are not api.
    // TODO: when cyclic is solved can revert to pattern as used for api-sim
    const aoApi = require('../lib/')
    const notApi = '_stats, version, g, root, omitTraceId, logger, loggers, logLevel, logLevelAdd, logLevelRemove, probes, specialUrls, execEnv, cfg, getDomainPrefix, makeLogMissing, modeMap, modeToStringMap, contextProvider, cls, addon, reporter, control, startup, debugLogging, traceMode, sampleRate, tracing, traceId, lastEvent, lastSpan, maps, requestStore, resetRequestStore, clsCheck, stack, backtrace, bind, bindEmitter, setCustomTxNameFunction, wrappedFlag, notifications, fs'
    const apiKeys = new Set([...new Set([...Object.getOwnPropertyNames(aoApi)])].filter(item => notApi.indexOf(item) === -1))

    const aoSim = require('../lib/api-sim')(Object.assign({}, skeletalAo))
    const simKeys = new Set([...Object.getOwnPropertyNames(aoSim)])

    const missing = new Set()

    for (const key of apiKeys) {
      if (!simKeys.has(key)) {
        missing.add(key)
      }
    }

    if (missing.size) {
      errorCount += 1
      // eslint-disable-next-line no-console
      console.error('api keys missing from the simulated api:', [...missing].join(', '))
    }

    expect(errorCount).equal(0)
  })

  it('should make sure that the probe-defaults file has a default for each probe', function () {
    let errorCount = 0
    //
    // make sure that the probe-defaults file has a default for each probe.
    //
    let probeDefaults = []
    try {
      probeDefaults = Object.keys(require('../lib/probe-defaults'))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('cannot read ../lib/probe-defaults', e.code)
      errorCount += 1
    }

    // this only reads probes and one level below probes for directories starting
    // with '@'. it may have to change at some point but right now only the only
    // subdirectory with probes in it is @hapi and it serves double purpose - both
    // scoped and unscoped versions of hapi and vision.
    const probesInDir = []
    const probes = fs.readdirSync('lib/probes', { withFileTypes: true })
    probes.forEach(f => {
      if (f.isFile() && f.name.endsWith('.js')) {
        probesInDir.push(f.name.slice(0, -3))
      } else if (f.isDirectory() && f.name[0] === '@') {
        const files1 = fs.readdirSync(`lib/probes/${f.name}`, { withFileTypes: true })
        files1.forEach(f => {
          if (f.isFile() && f.name.endsWith('.js')) {
            probesInDir.push(f.name.slice(0, -3))
          }
        })
      }
    })

    const defaultProbes = new Set(probeDefaults)
    const implementedProbes = new Set(probesInDir)

    function intersection (s1, s2) {
      return new Set([...s1].filter(i => s2.has(i)))
    }

    function difference (s1, s2) {
      return new Set([...s1].filter(i => !s2.has(i)))
    }

    const commonProbes = intersection(defaultProbes, implementedProbes)
    const onlyInDefault = difference(defaultProbes, commonProbes)
    const onlyInProbesDir = difference(implementedProbes, commonProbes)

    //
    // clean up known exceptions
    //

    // http-client and https-client are implemented by the http.js and https.js probes
    onlyInDefault.delete('http-client')
    onlyInDefault.delete('https-client')

    if (onlyInDefault.size) {
      // eslint-disable-next-line no-console
      console.error(`probes with defaults but no probe file: ${[...onlyInDefault].join(', ')}`)
      errorCount += 1
    }

    if (onlyInProbesDir.size) {
      // eslint-disable-next-line no-console
      console.error(`probes with no default: ${[...onlyInProbesDir].join(', ')}`)
      errorCount += 1
    }

    expect(errorCount).equal(0)
  })
})
