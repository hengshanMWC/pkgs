import { executeCommandTag } from '../../index'
const cmd = 'tag'
describe(cmd, () => {
  test('default', async () => {
    await executeCommandTag()
  })
  test('version', async () => {
    await executeCommandTag({
      v: true,
    })
  })

  test(`publish, ${cmd} sync`, async () => {
    await executeCommandTag({
      p: true,
    })
  })

  test('all', async () => {
    await executeCommandTag({
      v: true,
      p: true,
    })
  })
})
