# Two minutes on how it works

`/lib/index.js` runs when the user's code requires `solarwinds-apm`. It uses
`lib/get-unified-config.js` to determine the configuration and sets up the
agent. Eventually it reads the files in `lib/probes` and enables patching.

The patching mechanism works by intercepting `require(...)` calls. It is in
`lib/require-patch.js`.

Tests live in the `test` directory, with a `test/probes` sub-directory for tests
specific to a given instrumented module. The file in `test` follow a naming
scheme of `${name}.test.js` for files intended to be run by the test runner,
files with the normal scheme of `${name}.js` are just meant to be used by other files
in the test directory.


# Local Development

Development **must be done on Linux**.

To setup a development environment on a Mac use a Docker container (see below).

Mac should have:
  * [Docker](https://docs.docker.com/docker-for-mac/install/)
  * [Xcode command line tools](https://developer.apple.com/download/more/?=command%20line%20tools) (simply installed by terminal `git` command)
  * [SSH keys at github](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

Those are available in the Docker Dev Container.


## Project layout

* `lib/` contains the core modules that implement the agent.
* `lib/probes` contains code that patches auto-instrumented modules (a.k.a probes).
* `test/` contains the mocha based test suite.
* `test/probes/` contains tests for the auto-instrumented modules (a.k.a probes).
* `test/java-collector` contains a local collector usable for testing. `test/certs/` contains certificates for the collector.
* `.github` contains the files for github actions.
* `dev` directory contains anything related to dev environment


## Instrumenting Using Local Code

The Agent dev environment mounts the code into `usr/src/work` and also mounts two siblings directories if they exist: `bindings` and `instrumented`.
The former should hold a clone of the bindings repo, the latter is for the `node-instrumented` repo clone. It is meant to act as a "playground" to build and instrument real node apps (e.g. an app that uses `express` as the web server and `morgan` for logging). This setup allows linking local versions of bindings and agent for end-to-end development.

### Linking to Bindings

1. Start the bindings dev environment: `npm run dev`.
2. Start the agent dev environment: `npm run dev`
3. Link the bindings: `npm link ../bindings --save`

Notes: 
- Order is important.
- Dev environments "clean up" when the container is stopped. They must be started in order for linking to work.
- In the bindings dev environment run `npm rebuild` when making c++ code changes.

### Linking to Instrumented App

1. Open a new shell to the dev environment

`docker exec -it -w /usr/src/instrumented dev-agent bash -c "unset SW_APM_REPORTER && unset SW_APM_COLLECTOR && bash"`

Note:
- dev environment uses UDP reporter and a local host collector. The new shell shall use the default (production) instead.

2. cd into the instrumented app directory (e.g `cd frameworks/fs`)
3. Remove previous installs `rm -rf node_modules` (if exists).
4. Reinstall dependencies `npm install`.
3. Link the agent: `npm link {../relative_path}` (e.g. `npm link ../../../work --save`)

Tip: if `npm link` output `Error: Argument #2: Expected array but got string` it is because the path is not pointing at a valid package. Try to add or remove dots...

## Testing

Test are run using [Mocha](https://github.com/mochajs/mocha).

1. Run `npm test` to run the test suite. All tests, but one, run using a mock reporter that listens on UDP port 7832 (hard-coded in `test/helper.js`). The mock reporter intercepts UDP messages and checks them for correctness.

The `test` script in `package.json` runs `test.sh` which then manages how mocha runs each test file. To run individual tests use `npx mocha`. For example: `npx mocha test/probes/http.test.js` will run the `http` native module instrumentation tests.

## Docs

The repo includes API docs that are auto generated from code comments.
`npm run docs:api`.


# Additional Info

* [Development & Release with GitHub Actions ](./github-actions.md)
* [Release Process](./release-process.md)
