import { commandVersion } from '../../src/index'
import { getPackages } from '../__fixtures__/commit'
import {
  changePackagesFileGitCommit,
  handleCommand,
  newSimpleGit,
  setUpFilesAdded,
} from '../__fixtures__'
import {
  Interdependence,
  ORIGINAL_CWD,
  addVersion,
  changePackagesFile2,
  dirInterdependenceArr,
  dirManyArr,
  dirManyCommandOrder,
  dirManyCommandOrderChange1,
  dirQuarantineArr,
  dirQuarantineCommandOrder,
  dirQuarantineCommandOrderChange1,
  dirQuarantineCommandOrderChange2,
  many,
  newVersion,
  newVersionBeta,
  quarantine,
  rootPackageJsonPath,
  single,
} from '../__fixtures__/constant'
import {
  cmd,
  createGit,
  diffTest,
  diffTestPackage,
  diffTestPackageList,
  syncTest,
  tagCommit,
  testPackage,
  testPackages,
} from '../__fixtures__/cmd/version'

afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
describe.only(`${cmd}: ${quarantine}`, () => {
  test(`${quarantine}: default(sync)`, async () => {
    const { git } = await createGit(quarantine)
    await syncTest(newVersionBeta, dirQuarantineArr, git)
    await syncTest(newVersion, dirQuarantineArr, git)
    await syncTest(addVersion, dirQuarantineArr, git)
  })
  test(`${quarantine}`, async () => {
    const { git, context } = await createGit(quarantine)
    await diffTest(newVersionBeta, dirQuarantineArr, git)
    await changePackagesFileGitCommit(context)
    await diffTest(newVersion, dirQuarantineCommandOrderChange1, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await diffTest(addVersion, dirQuarantineCommandOrderChange2, git)
  })
}, 1000000)
describe(`${cmd}: ${many}`, () => {
  test(`${many}: default(sync)`, async () => {
    await syncTest(many, newVersion)
    await testPackages(dirManyArr, newVersion)
  })
  test(`${many}`, async () => {
    const { git, context } = await diffTest(many, newVersion)
    await diffTestPackageList(dirManyArr, newVersion, git)
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
    await syncTest(Interdependence, newVersion)
    await testPackages(dirInterdependenceArr, newVersion)
  })
  test(`${Interdependence}`, async () => {
    const { git, context } = await diffTest(Interdependence, newVersion)
    await diffTestPackageList(dirInterdependenceArr, newVersion, git)

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

describe(`${cmd}: ${single}`, () => {
  test(`${single}: default(sync)`, async () => {
    await syncTest(single, newVersion)
    await testPackage(rootPackageJsonPath, newVersion)
  })
  test(`${single}`, async () => {
    const { git, context } = await diffTest(single, newVersion)
    await diffTestPackage(rootPackageJsonPath, newVersion, git)
    await setUpFilesAdded(context, ['test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    await diffTestPackage(rootPackageJsonPath, addVersion, git)
  })
})
