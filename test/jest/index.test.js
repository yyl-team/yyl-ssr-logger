const { Log, LogType } = require('../../')
const path = require('path')
const extFs = require('yyl-fs')
const fs = require('fs')
const { waitFor } = require('yyl-util')

const FRAG_PATH = path.join(__dirname, '__frag')

test('usage test', async () => {
  const logPath = path.join(FRAG_PATH, 'index')
  const runtimePath = path.join(logPath, 'runtime.log')
  const errorPath = path.join(logPath, 'error.log')
  const logs = []
  await extFs.removeFiles(logPath)
  const iLog = new Log({
    logPath,
    verbose: true,
    logger(type, args) {
      logs.push([type, args])
    }
  })

  // + input
  iLog.log({
    type: LogType.Info,
    path: '/index',
    args: ['123', { zz: 'abc' }]
  })

  iLog.log({
    type: LogType.Error,
    path: '/index',
    args: ['123', new Error('456')]
  })
  // - input

  await waitFor(1000)
  // + check
  expect(fs.existsSync(runtimePath)).toEqual(true)
  expect(fs.existsSync(errorPath)).toEqual(true)
  expect(fs.readFileSync(runtimePath).toString().split('\n').length).toEqual(3)
  expect(fs.readFileSync(errorPath).toString().split('\n').length).toEqual(2)
  expect(logs.length).toEqual(3)
  // - check
})
