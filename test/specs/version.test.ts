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
  dirManyCommandOrderChange2,
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
describe(`${cmd}: ${quarantine}`, () => {
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
})
describe(`${cmd}: ${many}`, () => {
  test(`${many}: default(sync)`, async () => {
    const { git } = await createGit(many)
    await syncTest(newVersionBeta, dirManyArr, git)
    await syncTest(newVersion, dirManyArr, git)
    await syncTest(addVersion, dirManyArr, git)
  })
  test(`${many}`, async () => {
    const { git, context } = await createGit(many)
    await diffTest(newVersionBeta, dirManyArr, git)
    await changePackagesFileGitCommit(context)
    await diffTest(newVersion, dirManyCommandOrderChange1, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await diffTest(addVersion, dirManyCommandOrderChange2, git)
  })
})
// describe(`${cmd}: ${Interdependence}`, () => {
//   test(`${Interdependence}: default(sync)`, async () => {
//     await syncTest(Interdependence, newVersion)
//     await testPackages(dirInterdependenceArr, newVersion)
//   })
//   test(`${Interdependence}`, async () => {
//     const { git, context } = await diffTest(Interdependence, newVersion)
//     await diffTestPackageList(dirInterdependenceArr, newVersion, git)

//     await setUpFilesAdded(context, ['packages/a/test'])
//     await commandVersion({
//       mode: 'diff',
//     }, git, addVersion)
//     const [aPackageJson, bPackageJson, cPackageJson] = await getPackages(dirInterdependenceArr)
//     await tagCommit(aPackageJson, addVersion, git)
//     await tagCommit(bPackageJson, newVersion, git)
//     await tagCommit(cPackageJson, addVersion, git)
//   })
// })

// describe(`${cmd}: ${single}`, () => {
//   test(`${single}: default(sync)`, async () => {
//     await syncTest(single, newVersion)
//     await testPackage(rootPackageJsonPath, newVersion)
//   })
//   test(`${single}`, async () => {
//     const { git, context } = await diffTest(single, newVersion)
//     await diffTestPackage(rootPackageJsonPath, newVersion, git)
//     await setUpFilesAdded(context, ['test'])
//     await commandVersion({
//       mode: 'diff',
//     }, git, addVersion)
//     await diffTestPackage(rootPackageJsonPath, addVersion, git)
//   })
// })
