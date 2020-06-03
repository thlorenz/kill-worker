import test from 'tape'
import { Worker } from 'worker_threads'
import { testWorkerScript } from './utils'
import killWorker from '../kill-worker'

const exitNormalMsg = { kind: 'TERM:NORMAL' }
const exitWithErrorMsg = { kind: 'TERM:ERROR', exitCode: 2 }
const exitRefuseMsg = { kind: 'TERM:REFUSE' }

test('given a worker that complies with the terminate request', async (t) => {
  const worker = new Worker(testWorkerScript, { eval: true })
  try {
    const exitCode = await killWorker(worker, exitNormalMsg)
    t.equal(exitCode, 0, 'kills cleanly with 0 exit code')
  } catch (err) {
    t.fail(err)
  } finally {
    t.end()
  }
})

test('given a worker that complies, but exits with an error', async (t) => {
  const worker = new Worker(testWorkerScript, { eval: true })
  try {
    await killWorker(worker, exitWithErrorMsg)
    t.fail('should reject')
  } catch (err) {
    t.match(err.message, /non-zero.+2/, 'rejects with worker exit code')
  } finally {
    t.end()
  }
})

test('given a worker that does not comply with the terminate request', async (t) => {
  const worker = new Worker(testWorkerScript, { eval: true })
  try {
    await killWorker(worker, exitRefuseMsg)
    t.fail('should reject')
  } catch (err) {
    t.match(
      err.message,
      /non-zero.+1/,
      'still kills, but rejects with non-zero (1) exit code'
    )
  } finally {
    t.end()
  }
})
