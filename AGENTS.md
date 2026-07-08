## Architecture

## Tests

For tests, we have this setup:

our /examples folder is a nextjs app

our tests are in /examples/src/pages/tests - a test is a .page.tsx file served by nextjs that has a sibling .spec.ts file
which is a playwright file

the /examples need `npm run serve:data` script running (from the /www folder)

for running a test, I run `npm run dev` in examples and `npm run test:watch` and then hit save in either the spec file or the corresponding page.
this runs the test in dev - first start could take a bit of time when initially compiling the page.

for running the whole suite, run `npm run test` in /examples folder - but make sure www runs the `npm run serve:data`

## Dev server logs

Long-running dev servers tee stdout/stderr to local log files. Read these when debugging runtime, compile, or test failures. Do not start duplicate servers if one is already running.

### examples

| Script | Log file |
|--------|----------|
| `npm run dev:next` | `examples/.logs/dev-next.log` |
| `npm run dev:test-runner` | `examples/.logs/dev-test-runner.log` |
| `npm run start-server` | `examples/.logs/start-server.log` |
| `npm run start` | `examples/.logs/next-start.log` |

when developing I only run `npm run dev`, which runs `dev:next` and `dev:test-runner` in parallel (see both logs above).

### www

| Script | Log file |
|--------|----------|
| `npm run serve:data` | `www/.logs/serve-data.log` |
| `npm run debug:data` | `www/.logs/debug-data.log` |
| `npm run next-dev` (via `npm run dev`) | `www/.logs/next-dev.log` |
| `npm run serve-build` | `www/.logs/serve-build.log` |
| `npm run start` | `www/.logs/next-start.log` |

Most of the time, in development, I only run `npm run serve:data`