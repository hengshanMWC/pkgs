import { commandVersion } from '../../src/index'
import { getPackages } from '../__fixtures__/commit'
import {
  setUpFilesAdded,
} from '../__fixtures__'
import {
  Interdependence,
  ORIGINAL_CWD,
  addVersion,
  dirInterdependenceArr,
  dirManyArr,
  dirQuarantineArr,
  many,
  newVersion,
  quarantine,
} from '../__fixtures__/constant'
import { cmd, diffTest, syncTest, tagCommit } from '../__fixtures__/cmd/version'

afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
describe(`${cmd}: ${quarantine}`, () => {
  test(`${quarantine}: default(sync)`, async () => {
    await syncTest(quarantine, dirQuarantineArr, newVersion)
  })
  test(`${quarantine}`, async () => {
    const { git, context } = await diffTest(quarantine, dirQuarantineArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson] = await getPackages(dirQuarantineArr)
    tagCommit(aPackageJson, addVersion, git)
    tagCommit(bPackageJson, newVersion, git)
  })
})
describe(`${cmd}: ${many}`, () => {
  test(`${many}: default(sync)`, async () => {
    await syncTest(many, dirManyArr, newVersion)
  })
  test(`${many}`, async () => {
    const { git, context } = await diffTest(many, dirManyArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const packageJsonList = await getPackages(dirManyArr)
    const abPackageJson = packageJsonList.splice(0, 2)
    const abPackageJsonTagList = abPackageJson.map(packageJson => tagCommit(packageJson, addVersion, git))
    const cdePackageJsonTagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
    await abPackageJsonTagList
    await cdePackageJsonTagList
  })
})
describe(`${cmd}: ${Interdependence}`, () => {
  test(`${Interdependence}: default(sync)`, async () => {
    await syncTest(Interdependence, dirInterdependenceArr, newVersion)
  })
  test(`${Interdependence}`, async () => {
    const { git, context } = await diffTest(Interdependence, dirInterdependenceArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson, cPackageJson] = await getPackages(dirInterdependenceArr)
    await tagCommit(aPackageJson, addVersion, git)
    await tagCommit(bPackageJson, newVersion, git)
    await tagCommit(cPackageJson, addVersion, git)
  })
})
