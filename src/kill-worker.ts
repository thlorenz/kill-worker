import { Worker } from 'worker_threads'

export function gracefullyKillWorker(
  worker: Worker,
  killMsg: Record<string, any>
): Promise<void> {
  return new Promise((resolve, reject) => {
    let cleanup: () => void
    let completed: boolean = false

    const handleWorkerExit = (exitCode: number) => {
      if (exitCode !== 0) {
        reject(
          new Error(`Worker terminated with non-zero exit code ${exitCode}`)
        )
      } else {
        resolve()
      }
    }

    const terminate = async () => {
      cleanup()
      if (completed) return
      const exitCode = await worker.terminate()
      handleWorkerExit(exitCode)
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

    const timeout = setTimeout(terminate, 1e3)

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
