/* global it, describe, before, beforeEach, after, afterEach */
'use strict'

const helper = require('../helper')
const { apm } = require('../1.test-common.js')

const noop = helper.noop
const addon = apm.addon

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const expect = require('chai').expect

const pkg = require('mongodb/package.json')
const semver = require('semver')

const hosts = {
  2.6: process.env.SW_APM_TEST_MONGODB_2_6 || 'mongo_2_6:27017',
  '3.x': process.env.SW_APM_TEST_MONGODB_3_0 || 'mongo_3:27017',
  '4.x': process.env.SW_APM_TEST_MONGODB_4_0 || 'mongo_4:27017',
  '5.x': process.env.SW_APM_TEST_MONGODB_5_0 || 'mongo_5:27017',
  'replica set': process.env.SW_APM_TEST_MONGODB_SET
}

// see https://www.mongodb.com/docs/drivers/node/current/compatibility/
if (semver.gte(pkg.version, '4.0.0')) delete hosts[2.6]

// use AO_IX if present. It provides a unique ID to prevent collisions
// during matrix testing. It's not needed when testing only one instance
// at a time locally. Save database name and collection name.

const dbn = 'test' + (process.env.AO_IX ? '-' + process.env.AO_IX : '')
const cn = `coll-${dbn}`

describe('probes.mongodb UDP', function () {
  let emitter

  //
  // Intercept messages for analysis
  //
  before(function (done) {
    emitter = helper.backend(done)
    apm.sampleRate = apm.addon.MAX_SAMPLE_RATE
    apm.traceMode = 'enabled'
    apm.g.testing(__filename)
  })
  after(function (done) {
    emitter.close(done)
  })

  // fake test to work around UDP dropped message issue
  it('UDP might lose a message', function (done) {
    helper.test(emitter, function (done) {
      apm.instrument('fake', noop)
      done()
    }, [
      function (msg) {
        msg.should.have.property('Label').oneOf('entry', 'exit')
        msg.should.have.property('Layer', 'fake')
      }
    ], done)
  })

  it('should be configured to sanitize objects by default', function () {
    apm.probes.mongodb.should.have.property('sanitizeObject', true)
    apm.probes.mongodb.sanitizeObject = false
  })
})

describe(`probes.mongodb ${pkg.version}`, function () {
  Object.keys(hosts).forEach(function (host) {
    const db_host = hosts[host]
    if (!db_host) return
    describe(host, function () {
      makeTests(db_host, host, host === 'replica set')
    })
  })
})

//
// make the tests
//
function makeTests (db_host, host, isReplicaSet) {
  const ctx = {}
  let emitter
  let db

  const options = {
    writeConcern: { w: 1 },
    ordered: true
  }

  const hosts = db_host.split(',').map(function (host) {
    const parts = host.split(':')
    host = parts.shift()
    const port = parts.shift()
    return {
      host,
      port: Number(port)
    }
  })

  // Connection URL (add trailing to test RemoteHost)
  const hostStr = `${hosts[0].host}:${hosts[0].port}`
  const url = `mongodb://${hostStr}/?`

  //
  // Intercept messages for analysis
  //
  beforeEach(function (done) {
    apm.probes.fs.enabled = false
    apm.probes.dns.enabled = false
    apm.sampleRate = addon.MAX_SAMPLE_RATE
    apm.traceMode = 'enabled'
    apm.probes.mongodb.collectBacktraces = false
    emitter = helper.backend(function () {
      done()
    })
  })
  afterEach(function (done) {
    apm.probes.fs.enabled = true
    apm.probes.dns.enabled = true
    emitter.close(function () {
      done()
    })
  })

  //
  // Open a fresh mongodb connection for each test
  //
  before(function (done) {
    apm.loggers.test.debug(`using dbn ${dbn}`)

    let server
    const mongoOptions = {}

    // server = new mongodb.Server(host.host, host.port)
    const mongoClient = new MongoClient(url, mongoOptions)

    mongoClient.connect((err, _client) => {
      apm.loggers.test.debug('mongoClient() connect callback', err)
      if (err) {
        // eslint-disable-next-line no-console
        console.log('error connecting', err)
        return done(err)
      }
      ctx.server = server
      ctx.client = _client
      ctx.mongo = db = _client.db(dbn)
      ctx.collection = db.collection(cn)

      db.command({ dropDatabase: 1 }, function (err) {
        apm.loggers.test.debug('before() dropDatabase callback', err)
        done()
      })
    })
  })
  after(function () {
    if (ctx.client) {
      ctx.client.close()
    }
  })

  const check = {
    base: function (msg) {
      msg.should.have.property('Spec', 'query')
      msg.should.have.property('Flavor', 'mongodb')
      msg.should.have.property('RemoteHost', hostStr)
    },
    common: function (msg) {
      msg.should.have.property('Database', `${dbn}`)
    },
    entry: function (msg) {
      const explicit = `${msg.Layer}:${msg.Label}`
      expect(explicit).equal('mongodb:entry', 'message Layer and Label must be correct')
      check.base(msg)
    },
    exit: function (msg) {
      const explicit = `${msg.Layer}:${msg.Label}`
      expect(explicit).equal('mongodb:exit', 'message Layer and Label must be correct')
    }
  }

  //
  // Tests
  //
  const tests = {
    databases: function () {
      it('should drop', function (tdone) {
        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'drop')
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          db.command({ dropDatabase: 1 }, done)
        }, steps, tdone)
      })
    },

    //
    // collections tests
    //
    collections: function () {
      it('should create', function (done) {
        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'create_collection')
          msg.should.have.property('New_Collection_Name', cn)
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          db.command({ create: cn },
            function (e, data) {
              if (e) {
                apm.loggers.error(`error creating "${cn}"`, e)
                done(e)
                return
              }
              done()
            }
          )
        }, steps, done)
      })

      it('should rename', function (done) {
        function entry (msg) {
          check.entry(msg)
          msg.should.have.property('QueryOp', 'rename')
          msg.should.have.property('New_Collection_Name', `coll2-${dbn}`)
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        const adminDb = ctx.client.db('admin')

        helper.test(emitter, function (done) {
          adminDb.command(
            {
              renameCollection: `${dbn}.${cn}`,
              to: `${dbn}.coll2-${dbn}`,
              dropTarget: true
            },
            function (e, data) {
              if (e) {
                apm.loggers.debug(`error renaming "${cn}" to "${dbn}.coll2-${dbn}"`, e)
                done(e)
                return
              }
              done()
            }
          )
        }, steps, done)
      })

      it('should drop', function (done) {
        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'drop_collection')
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          db.command(
            { drop: `coll2-${dbn}` },
            function (e, data) {
              if (e) {
                apm.loggers.debug(`error dropping "coll2-${dbn}`, e)
                done(e)
                return
              }
              done()
            }
          )
        }, steps, done)
      })
    },

    //
    // query tests
    //
    queries: function () {
      it('should insertMany', function (done) {
        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'insert')
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.insertMany(
            [{ a: 1 }, { a: 2 }]
          ).then(results => done())
        }, steps, done)
      })

      it('should updateOne', function (done) {
        const query = { a: 1 }
        const update = {
          $set: { b: 1 }
        }

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'update')
          msg.should.have.property('Query', JSON.stringify([query]))
          msg.should.have.property('Update_Document', JSON.stringify([update]))
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.updateOne(
            query,
            update
          ).then(results => done())
        }, steps, done)
      })

      // calls topologies but function is "findAndModify"
      it('should findOneAndUpdate', function (done) {
        const query = { a: 1 }
        const update = { $set: { a: 1, b: 2 } }

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'find_and_modify')
          msg.should.have.property('Query', JSON.stringify(query))
          msg.should.have.property('Update_Document', JSON.stringify(update))
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]
        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }
        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.findOneAndUpdate(
            query,
            update
          )
            .then(results => done())
            .catch(err => {
              done(err)
            })
        }, steps, done)
      })

      it('should distinct', function (done) {
        const query = { a: 1 }
        const key = 'b'

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'distinct')
          msg.should.have.property('Query', JSON.stringify(query))
          msg.should.have.property('Key', key)
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry, exit]

        helper.test(emitter, function (done) {
          ctx.collection.distinct(
            key,
            query,
            options
          ).then(results => done())
        }, steps, done)
      })

      it('should count', function (done) {
        const query = { a: 1 }
        const pipeline = '[{"$match":{"a":1}},{"$group":{"_id":1,"n":{"$sum":1}}}]'

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp').oneOf('count', 'aggregate')
          if (msg.QueryOp === 'count') {
            msg.should.have.property('Query', JSON.stringify(query))
          } else {
            msg.should.have.property('Pipeline', pipeline)
          }
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry, exit]

        helper.test(emitter, function (done) {
          ctx.collection.count(
            query,
            options
          ).then(results => done())
        }, steps, done)
      })

      it('should countDocuments', function (done) {
        const query = { a: 1 }
        const pipeline = '[{"$match":{"a":1}},{"$group":{"_id":1,"n":{"$sum":1}}}]'

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp').oneOf('count', 'aggregate')
          if (msg.QueryOp === 'count') {
            msg.should.have.property('Query', JSON.stringify(query))
          } else {
            msg.should.have.property('Pipeline', pipeline)
          }
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry, exit]

        helper.test(emitter, function (done) {
          ctx.collection.countDocuments(
            query,
            options
          ).then(results => done())
        }, steps, done)
      })

      it('should remove', function (done) {
        const query = { a: 1 }

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'remove')
          msg.should.have.property('Query', JSON.stringify([query]))
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]
        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }
        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.remove(
            query,
            { justOne: true }
          ).then(results => done())
        }, steps, done)
      })
    },

    indexes: function () {
      it('should create_indexes', function (done) {
        const index = {
          key: { a: 1, b: 2 },
          name: 'mimi'
        }

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'create_indexes')
          msg.should.have.property('Indexes', JSON.stringify([index]))
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]
        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }
        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.createIndexes([index], options)
            .then(results => done())
            .catch(e => {
              done(e)
            })
        }, steps, done)
      })

      if (semver.lt(pkg.version, '4.0.0')) {
        it('should reindex', function (done) {
          function entry (msg) {
            check.entry(msg)
            check.common(msg)
            msg.should.have.property('QueryOp', 'reindex')
          }

          function exit (msg) {
            check.exit(msg)
          }

          const steps = [entry]
          if (isReplicaSet) {
            steps.push(entry)
            steps.push(exit)
          }
          steps.push(exit)

          helper.test(emitter, function (done) {
            ctx.collection.reIndex()
              .then(results => done())
          }, steps, done)
        })
      }

      it('should drop_indexes', function (done) {
        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'drop_indexes')
          msg.should.have.property('Index', JSON.stringify('*'))
        }
        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]
        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }
        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.dropIndexes()
            .then(results => done())
        }, steps, done)
      })
    },

    cursors: function () {
      it('should find', function (done) {
        helper.test(emitter, function (done) {
          const cursor = ctx.collection.find(
            { a: 1 },
            options
          )
          cursor.next(done)
        }, [
          function (msg) {
            check.entry(msg)
          },
          function (msg) {
            check.exit(msg)
          }
        ], done)
      })
    },

    aggregations: function () {
      if (semver.lt(pkg.version, '4.0.0')) {
        if (host === '2.6' || host === '3.x') {
          it('should group', function (done) {
            const group = {
              ns: `${dbn}.data-${dbn}`,
              key: {},
              initial: { count: 0 },
              $reduce: function (doc, out) { out.count++ }.toString(),
              out: 'inline',
              cond: { a: { $gte: 0 } }
            }

            function entry (msg) {
              check.entry(msg)
              check.common(msg)
              msg.should.have.property('QueryOp', 'group')
              msg.should.have.property('Group_Reduce', group.$reduce.toString())
              msg.should.have.property('Group_Initial', JSON.stringify(group.initial))
              msg.should.have.property('Group_Condition', JSON.stringify(group.cond))
              msg.should.have.property('Group_Key', JSON.stringify(group.key))
            }

            function exit (msg) {
              check.exit(msg)
            }

            const steps = [entry]

            if (isReplicaSet) {
              steps.push(entry)
              steps.push(exit)
            }

            steps.push(exit)

            helper.test(emitter, function (done) {
              ctx.collection.group(
                {},
                { a: { $gte: 0 } },
                { count: 0 },
                function (doc, out) { out.count++ }.toString()
              ).then(results => done())
            }, steps, done)
          })
        }
      }

      it('should map_reduce', function (done) {
        // eslint-disable-next-line
        function map () {emit(this.a, 1)}
        function reduce (k, vals) { return 1 }

        function entry (msg) {
          check.entry(msg)
          check.common(msg)
          msg.should.have.property('QueryOp', 'map_reduce')
          msg.should.have.property('Reduce_Function', reduce.toString())
          msg.should.have.property('Map_Function', map.toString())
        }

        function exit (msg) {
          check.exit(msg)
        }

        const steps = [entry]

        if (isReplicaSet) {
          steps.push(entry)
          steps.push(exit)
        }

        steps.push(exit)

        helper.test(emitter, function (done) {
          ctx.collection.mapReduce(
            map.toString(),
            reduce.toString(),
            { out: { inline: 1 } }
          ).then(results => done())
        }, steps, done)
      })
    }
  }

  describe('databases', tests.databases)
  describe('collections', tests.collections)
  describe('queries', tests.queries)
  describe('indexes', tests.indexes)
  describe('cursors', tests.cursors)
  describe('aggregations', tests.aggregations)
}
