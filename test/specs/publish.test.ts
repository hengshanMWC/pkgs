import { cmd, testPublish } from '../__fixtures__/cmd/publish'
import {
  dirQuarantineArr,
  quarantine,
} from '../__fixtures__/constant'

describe(`${cmd}: ${quarantine}`, () => {
  test(`${quarantine}: default(sync)`, async () => {
    await testPublish(quarantine, dirQuarantineArr)
    await testPublish(quarantine, dirQuarantineArr, 'test')
  }, 20000)
})
