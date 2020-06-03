import { Worker } from 'worker_threads'

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
export default function gracefullyKillWorker(
  worker: Worker,
  killMsg: any,
  timeoutMs: number = 1e3
): Promise<number> {
  return new Promise((resolve, reject) => {
    let cleanup: () => void
    let completed: boolean = false

    const handleWorkerExit = (exitCode: number) => {
      if (exitCode !== 0) {
        reject(
          new Error(`Worker terminated with non-zero exit code ${exitCode}`)
        )
      } else {
        resolve(exitCode)
      }
    }

    const terminate = async () => {
      if (completed) return
      try {
        // Ignoring exit code here as it is guaranteed to be emitted before
        // promise resolves
        // https://nodejs.org/api/worker_threads.html#worker_threads_worker_terminate
        await worker.terminate()
      } catch (err) {
        reject(err)
      } finally {
        cleanup()
        completed = true
      }
    }

    const onWorkerError = (err: Error) => {
      cleanup()
      if (completed) return
      completed = true
      reject(err)
    }

    const onWorkerExit = (exitCode: number) => {
      cleanup()
      if (completed) return
      completed = true
      handleWorkerExit(exitCode)
    }

    const timeout = setTimeout(terminate, timeoutMs)

    cleanup = () => {
      clearTimeout(timeout)
      worker.off('error', onWorkerError).off('exit', onWorkerExit)
    }

    worker
      .once('error', onWorkerError)
      .once('exit', onWorkerExit)
      .postMessage(killMsg)
  })
}
