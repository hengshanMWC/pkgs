import { executeCommand } from '../../index'
const cmd = 'publish'
describe.skip(cmd, () => {
  test('default', async () => {
    await executeCommand(cmd)
  })
  test('root diff', async () => {
    await executeCommand(cmd, {
      mode: 'diff',
    })
  })

  test(`root diff, ${cmd} sync`, async () => {
    await executeCommand(cmd, {
      mode: 'diff',
      [cmd]: {
        mode: 'sync',
      },
    })
  })

  test('message', async () => {
    await executeCommand(cmd, {
      [cmd]: {
        tag: 'test',
      },
    })
  })
})
