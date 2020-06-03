import test from 'tape'
import { Worker } from 'worker_threads'
import { testWorkerScript } from './utils'

test('given a worker that complies with the terminate request', async (t) => {
  const worker = new Worker(testWorkerScript, { eval: true })
  t.end()
})
