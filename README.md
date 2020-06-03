# kill-worker

Gracefully kill a worker, making sure it terminates in either case.

```typescript
// worker.js
const { parentPort } = require('worker_threads')
parentPort.on('message', (msg) => {
  switch (msg.kind) {
    case 'TERM': {
      return process.exit(0)
    }
    case 'WORK': {
      console.log('normally would do some work here')
      break
    }
    default:
      throw new Error(msg.kind)
  }
})

// main.js
import killWorker from 'kill-worker'
const worker = new Worker('/path/to/worker.js')

// ... after we don't need the worker anymore
try {
  // exit code is always 0 here
  const exitCode = await killWorker(worker, exitNormalMsg)
} catch (err) {
  // exit code is always non-zero here and included in the error message
}
```

## Installation

    npm install kill-worker

## API

```typescript
/**
 * Kills a worker.
 * First gracefully by sending the provided message so it can exit itself
 * via `process.exit`.
 * If worker doesn't comply and exit within the given `timeoutMs` it is terminated
 * via `worker.terminate`.
 *
 * @param worker the worker to kill
 * @param killMsg the message to send to the worker to comply and exit itself
 * @param timeoutMs timeout in milliseconds after which worker is forcefully terminated
 * @return a promise which resolves if worker exits non-zero and rejects if worker exits
 * non-zero. When worker needs to be terminated the exit code will be non-zero as well.
 */
function killWorker(
  worker: Worker,
  killMsg: any,
  timeoutMs: number = 1e3
): Promise<number>
```

## License

MIT
