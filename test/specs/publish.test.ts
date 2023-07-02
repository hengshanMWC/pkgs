import { cmd, testPublish } from '../__fixtures__/cmd/publish'
import {
  bate,
  dirQuarantineArr,
  newVersion,
  newVersionBeta,
  quarantine,
} from '../__fixtures__/constant'

describe(`${cmd}: ${quarantine}`, () => {
  test(`${quarantine}: default(sync)`, async () => {
    await testPublish(quarantine, dirQuarantineArr, newVersion)
    await testPublish(quarantine, dirQuarantineArr, newVersionBeta, bate)
  }, 20000)
})
