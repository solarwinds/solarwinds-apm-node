# SolarWinds APM

The `solarwinds-apm` module provides [SolarWinds](https://www.solarwinds.com) instrumentation for Node.js.

It supports most commonly used databases, frameworks, and packages automatically. An
API allows anything to be instrumented.

A [SolarWinds](https://www.solarwinds.com) account is required to view traces & metrics.
Accounts are [free](https://www.solarwinds.com) for development and testing use. For production usage a [free trial](https://www.solarwinds.com)
is a great way to start.

## Dependencies

This is a **Linux Only package** with no Mac or Windows support. When installed on Mac or Windows (for development) it will degrade gracefully.

It is compatible with Node versions 14, 16 and 18. See [node status](https://github.com/nodejs/Release) for more.

It is dependent on [solarwinds-apm-bindings](https://github.com/solarwindscloud/solarwinds-bindings-node) binary add-on. 

### Binary dependency

The SolarWinds APM Agent will first attempt to install a prebuilt binary add-on using [node-pre-gyp](https://github.com/mapbox/node-pre-gyp). Prebuilt binaries are provided for various versions of Alpine, Centos, Amazon Linux and Red Hat Enterprise Linux.

Only if finding an appropriate prebuilt binary fails, will the agent attempt to build the binary add-on from source using [node-gyp](https://github.com/nodejs/node-gyp#on-unix). In such a case, the target platform should include the build toolchain.

Building with node-gyp (via node-pre-gyp) requires:

- Python (2 or 3 depending on version of npm)
- make
- A proper C/C++ compiler toolchain, like GCC

## Installation

The `solarwinds-apm` module is [available on npm](http://npmjs.org/package/solarwinds-apm) and can be installed
by navigating to your app root and running:

```
npm install --save solarwinds-apm
```

The agent requires a service key, obtained from the SolarWinds dashboard. This is set via the `SW_APM_SERVICE_KEY` environment variable, make
sure it is available in the environment where your application is running:

```
export SW_APM_SERVICE_KEY="api-token-here:your-service-name"
```

Then require `solarwinds-apm` as part of your application start command, or via a `require()` call in the entry point file before any other `require()` calls. 

Below are simple examples:

**Run Time (preferred)**
```
node -r solarwinds-apm <app.js>
```

**Build Time**
```
require('solarwinds-apm')
```

Now restart your app and you should see data in your SolarWinds dashboard in a minute or two.

## Important!

`solarwinds-apm` should be the first file required. 

If, for example, you are using the `esm` package to enable ES module syntax (import rather than require) and you use the following
command to invoke your program `node -r esm index.js` then `esm.js` is loaded first and `solarwinds-apm` is unable to instrument modules. You can use it, just make sure to require `solarwinds-apm` first, e.g., `node -r solarwinds-apm -r esm index.js`.

If you are using the custom instrumentation SDK then a reference to the SDK must be obtained,  like `const apm = require('solarwinds-apm')`. It you  use the command line option to require `solarwinds-apm` (e.g. `node -r solarwinds-apm -r esm index.js`) you can access the SDK using `const apm = global[Symbol.for('solarwinds-apm')]`

## Configuration

See the [Configuration Guide](https://github.com/solarwindscloud/solarwinds-apm-node/blob/main/CONFIGURATION.md)

## Upgrading

To upgrade an existing installation, navigate to your app root and run:

```
npm install --save solarwinds-apm@latest
```

## Support

If you find a bug or would like to request an enhancement, feel free to file
an issue. For all other support requests, please email technicalsupport@solarwinds.com.


## License

Copyright (c) 2016 - 2022 SolarWinds, LLC

Released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
