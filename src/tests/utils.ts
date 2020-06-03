function codeFromFunction(fn: () => void) {
  const lines = fn.toString().split('\n')
  return lines.slice(1, lines.length - 1).join('\n')
}

export const testWorkerScript = codeFromFunction(() => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { parentPort } = require('worker_threads')
  /* eslint-enable @typescript-eslint/no-var-requires */

  parentPort.on('message', (msg: Record<string, any>) => {
    switch (msg.kind) {
      case 'TERM:NORMAL': {
        return process.exit(0)
      }
      case 'TERM:ERROR': {
        return process.exit(msg.exitCode)
      }
      case 'TERM:REFUSE': {
        console.log('worker refuses to terminate')
        break
      }
      case 'WORK': {
        console.log('normally would do some work her')
        break
      }
      default:
        throw new Error(msg.kind)
    }
  })
})
