/* global it, describe, before, after */
'use strict'

const helper = require('../helper')
const { apm } = require('../1.test-common')
const semver = require('semver')

const postgres = require('pg')
const pkg = require('pg/package.json')

const addr = helper.Address.from(process.env.SW_APM_TEST_POSTGRES || 'postgres:5432')[0]

// using a null password is valid.
const password = 'SW_APM_TEST_POSTGRES_PASSWORD' in process.env ? process.env.SW_APM_TEST_POSTGRES_PASSWORD : 'xyzzy'
// make a unique table name so multiple tests can run concurrently without colliding.
const tName = 'tbl' + (process.env.AO_IX ? process.env.AO_IX : '')

const auth = {
  host: addr.host,
  port: addr.port,
  user: process.env.SW_APM_TEST_POSTGRES_USERNAME || 'postgres',
  password,
  database: 'test'
}

// pg 8.9.0 replaced its internal crypto implementation for auth with the crypto module
const usesCrypto = semver.satisfies(pkg.version, '>=8.9.0')
function skip (msg) {
  if (usesCrypto && msg.Layer === 'crypto') {
    return true
  } else {
    return false
  }
}

let hasNative = false
let nativeVer = '0.0.0'

try {
  require('pg/lib/native')
  nativeVer = require('pg-native/package').version
  hasNative = true
} catch (e) {
  apm.loggers.test.info('test/probes/pg failed to load pg native')
  hasNative = false
}

describe(`probes.pg ${pkg.version} pg-native ${nativeVer}`, function () {
  let emitter
  const ctx = { apm, tName, addr }

  // note: perform this test before setting test context since we flip the setting from default to false.
  it('should be configured to sanitize SQL by default', function () {
    apm.probes.pg.should.have.property('sanitizeSql', true)
    apm.probes.pg.sanitizeSql = false
  })

  it('should be configured to not tag SQL by default', function () {
    apm.probes.pg.should.have.property('tagSql', false)
  })

  //
  // Intercept messages for analysis
  //
  before(function (done) {
    if (apm.lastEvent) {
      const c = apm.requestStore.active ? apm.requestStore.active.id : null
      apm.loggers.debug(`id ${c} event.last at startup %e`, apm.lastEvent)
    }

    emitter = helper.backend(done)
    apm.sampleRate = apm.addon.MAX_SAMPLE_RATE
    apm.traceMode = 'enabled'
    apm.probes.fs.enabled = false
    apm.probes.dns.enabled = false
  })
  after(function (done) {
    emitter.close(done)
  })

  //
  // basic test setup and teardown
  //
  before(function () {
    apm.g.testing(__filename)
  })
  after(function () {
    apm.probes.fs.enabled = true
  })

  //
  // remove any leftover context
  //
  after(function () {
    apm.resetRequestStore()
  })

  //
  // database cleanup at end
  //

  //
  // Yes, this is super janky. But necessary because switching to
  // the native driver is destructive to the pooling mechanism.
  //
  // The postgres.native property must NOT be accessed
  // until the before() step of that test collection.
  //
  const drivers = {
    javascript: {
      skip: false,
      get: function () {
        return postgres
      },
      description: `javascript ${pkg.version}`
    },
    native: {
      skip: !hasNative,
      get: function () {
        return postgres.native
      },
      description: `native ${nativeVer}`
    }
  }

  //
  // Test against both native and js postgres drivers
  //
  const subtests = require('./pg/subtests')(apm, ctx)

  Object.keys(drivers).forEach(function (type) {
    const driver = drivers[type]
    if (driver.skip) {
      describe.skip(driver.description, test)
    } else {
      describe(driver.description, test)
    }

    function test (done) {
      after(function (done) {
        const p1 = ctx._client ? ctx._client.end() : Promise.resolve()
        // the pool waits for the delayed releases to finish
        let p2
        if (!ctx._pool) {
          p2 = Promise.resolve()
        } else {
          p2 = new Promise(function (resolve, reject) {
            const int = setInterval(function () {
              if (ctx._pool.idleCount === 2) {
                ctx._pool.end()
                  .then(results => {
                    clearInterval(int)
                    resolve(results)
                  })
              }
            }, 100)
          })
        }
        Promise.all([p1, p2])
          .then(results => {
            done()
          })
      })

      // test to work around UDP dropped message issue
      it('UDP might lose a message', function (done) {
        helper.test(emitter, function (done) {
          apm.instrument('fake', function () {})
          done()
        }, [
          function (msg) {
            msg.should.have.property('Label').oneOf('entry', 'exit')
            msg.should.have.property('Layer', 'fake')
          }
        ], done)
      })

      //
      // create a client, connect to the server, and create the db if needed
      //
      it('should create the pg testing context', function (done) {
        this.timeout(10000)
        const tmpAuth = Object.assign(Object.assign({}, auth), { database: 'postgres' })
        let client = new postgres.Client(tmpAuth)
        let pool

        client.connect()
          .then(() => {
            // delete the database so i can see what error occurs on the query
            // return client.query('drop database if exists test;')
          })
          .then(() => {
            return client.query('select datname from pg_catalog.pg_database where datname = \'test\';')
          })
          .then(results => {
            if (results.rowCount === 1) {
              return results
            }
            // 'test' doesn't exist so create it.
            return client.query('create database test;')
          })
          .then(results => {
            return client.end()
          })
          .then(results => {
            client = new postgres.Client(auth)
            return client.connect()
          })
          .then(results => {
            return client.query(`CREATE TABLE IF NOT EXISTS ${tName} (foo TEXT)`)
          })
          .catch(err => {
            done(err)
          })
          .then(results => {
            // get our client
            ctx._client = client
          })
          .then(results => {
            pool = new postgres.Pool(Object.assign({ max: 2 }, auth))
          })
          .catch(err => {
            done(err)
          })
          .then(results => {
            // get our pool
            ctx._pool = pool
            // make getClient return client (reset when delayed pools are tested)
            // no release is the same because the client is never actually released
            ctx.client = {
              get: () => ctx._client,
              getNoRelease: function (...args) {
                if (typeof args[args.length - 1] === 'function') {
                  return args[args.length - 1](null, ctx._client)
                } else {
                  return Promise.resolve(ctx._client)
                }
              },
              release: function () {}
            }
            return results
          })
          .then(done)
      })

      //
      // test each function with callbacks then promises.
      //
      describe('using client', function () {
        for (const t in subtests) {
          it(subtests[t].cb.text, function (done) {
            helper.test(
              emitter,
              subtests[t].cb.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })

          it(subtests[t].p.text, function (done) {
            helper.test(
              emitter,
              subtests[t].p.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })
        }
      })
      //
      // now test each function using a pooled connection. put the ctx.client
      // in the test so it only gets executed once the tests start, i.e., it
      // waits on the other tests.
      //
      describe('using pool', function () {
        for (const t in subtests) {
          it(subtests[t].cb.text, function (done) {
            ctx.client = poolFunctions
            helper.test(
              emitter,
              subtests[t].cb.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })

          it(subtests[t].p.text, function (done) {
            helper.test(
              emitter,
              subtests[t].p.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })
        }
      })

      describe('using pool with backed up queue', function () {
        it('should exhaust the pool', function (done) {
          let client1
          let client2

          function maybeDone () {
            if (client1 && client2) {
              ctx._pool.totalCount.should.equal(2)
              ctx._pool.idleCount.should.equal(0)
              done()
            }
          }

          ctx._pool.connect()
            .then(client => {
              client1 = client
              setTimeout(function () {
                client1.release()
              }, 1000)
              maybeDone()
            })
          ctx._pool.connect()
            .then(client => {
              client2 = client
              setTimeout(function () {
                client2.release()
              }, 1000)
              maybeDone()
            })
        })

        for (const t in subtests) {
          it(subtests[t].cb.text, function (done) {
            // wait 1/4 second.
            ctx.delayms = 250
            ctx.getClient = poolFunctions
            helper.test(
              emitter,
              subtests[t].cb.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })

          it(subtests[t].p.text, function (done) {
            helper.test(
              emitter,
              subtests[t].p.test,
              subtests[t].checks,
              done,
              { skip }
            )
          })
        }
      })

      //
      // this is used to replace the ctx.client so subtests
      // use the pooled interface without knowing it. the
      // subtests all call client.get() to get a client that
      // acts sort of like a pg client.
      //
      const poolPretendingToBeClient = {
        query: pooledClient
      }
      const poolFunctions = {
        get: () => poolPretendingToBeClient,
        getNoRelease: poolAcquireClient,
        release: poolReleaseClient
      }

      function pooledClient (...args) {
        // if the last arg is a function use the callback form otherwise
        // use promises.
        if (typeof args[args.length - 1] === 'function') {
          const fn = args[args.length - 1]
          ctx._pool.connect(function (err, client, release) {
            if (err) {
              fn(err)
              return
            }
            client.query(...args)
            delayedRelease(client)
          })
        } else {
          let c
          return ctx._pool.connect()
            .then(client => {
              c = client
              return client.query(...args)
            })
            .then(results => {
              delayedRelease(c)
              return results
            })
            .catch(err => {
              if (c) {
                delayedRelease(c)
              }
              throw err
            })
        }
      }

      function poolAcquireClient (...args) {
        if (typeof args[args.length - 1] === 'function') {
          const fn = args[args.length - 1]
          ctx._pool.connect(function (err, client, release) {
            if (err) {
              fn(err)
              return
            }
            fn(err, client)
          })
        } else {
          return ctx._pool.connect()
        }
      }

      function poolReleaseClient (client) {
        client.release()
      }

      function delayedRelease (client) {
        if (!ctx.delayms) {
          client.release()
          return
        }
        setTimeout(function () {
          try {
            client.release()
          } catch (e) {
            console.log(e) // eslint-disable-line no-console
          }
        }, ctx.delayms)
      }
    }
  })
})
