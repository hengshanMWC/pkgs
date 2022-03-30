// import { executeCommandTag } from '../../index'
import { files, mocks } from '../utils'
const cmd = 'tag'
const ORIGINAL_CWD = process.cwd()
describe(cmd, () => {
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', () => {
    files.create('package.json', { version: '1.0.0' })
    process.chdir('test/.tmp')
    // executeCommandTag()
    // The package.json file should have been updated
    expect(files.json('package.json')).to.deep.equal({ version: '1.0.0' })

    // Git and NPM should NOT have been called
    expect(mocks.git()).to.have.lengthOf(0)
  })
  // test('default', async () => {
  //   await executeCommandTag()
  // })
  // test('version', async () => {
  //   await executeCommandTag({
  //     v: true,
  //   })
  // })

  // test(`publish, ${cmd} sync`, async () => {
  //   await executeCommandTag({
  //     p: true,
  //   })
  // })

  // test('all', async () => {
  //   await executeCommandTag({
  //     v: true,
  //     p: true,
  //   })
  // })
})
