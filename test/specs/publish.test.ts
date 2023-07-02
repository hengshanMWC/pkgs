import { cmd, testPublish } from '../__fixtures__/cmd/publish'
import {
  bate,
  dirQuarantineArr,
  newVersion,
  newVersionBeta,
  quarantine,
} from '../__fixtures__/constant'

describe(`${cmd}: ${quarantine}`, () => {
  test('default', async () => {
    await testPublish(quarantine, dirQuarantineArr, newVersion)
  }, 10000)
  test('tag', async () => {
    await testPublish(quarantine, dirQuarantineArr, newVersionBeta, bate)
  }, 10000)
  test('tag test', async () => {
    await testPublish(quarantine, dirQuarantineArr, newVersionBeta, 'test', true)
  }, 10000)
})
