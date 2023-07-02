import { commandPublish } from '../../src'
import { cmd, testList, testPublish } from '../__fixtures__/cmd/publish'
import {
  bate,
  dirQuarantineArr,
  newVersion,
  newVersionBeta,
  quarantine,
  single,
} from '../__fixtures__/constant'

describe(`${cmd}: ${quarantine}`, () => {
  test('default', async () => {
    await testPublish(quarantine, newVersion)
    await testList(dirQuarantineArr)
  })
  test('tag', async () => {
    await testPublish(quarantine, newVersionBeta)
    await testList(dirQuarantineArr, bate)
  })
  test('tag test', async () => {
    await testPublish(quarantine, newVersionBeta)
    await testList(dirQuarantineArr, 'test', true)
  })
  test(`tag ${single}`, async () => {
    await testPublish(single, newVersion)
    const publishCmdList = await commandPublish()
    expect(publishCmdList[0]).toBe('pnpm publish')
  })
}, 20000)
