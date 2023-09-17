import {
  changePackagesFileGitCommit,
  setUpFilesAdded,
} from '../__fixtures__'
import {
  Interdependence,
  ORIGINAL_CWD,
  addVersion,
  changePackagesFile2,
  dirInterdependenceArr,
  dirInterdependenceCommandOrder,
  dirInterdependenceCommandOrderChange1,
  dirManyArr,
  dirManyCommandOrderChange1,
  dirManyCommandOrderChange2,
  dirQuarantineArr,
  dirQuarantineCommandOrderChange1,
  dirQuarantineCommandOrderChange2,
  many,
  newVersion,
  newVersionBeta,
  quarantine,
  rootPackageJsonArr,
  single,
} from '../__fixtures__/constant'
import {
  cmd,
  diffTest,
  syncTest,
} from '../__fixtures__/cmd/publish'
import { createGit } from '../__fixtures__/cmd/version'

afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
describe(`${cmd}: ${quarantine}`, () => {
  test(`${quarantine}: default(sync)`, async () => {
    const { git, context } = await createGit(quarantine)
    await syncTest(newVersionBeta, dirQuarantineArr, git)
    await changePackagesFileGitCommit(context)
    await syncTest(newVersion, dirQuarantineArr, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await syncTest(addVersion, dirQuarantineArr, git)
  })
  test(`${quarantine}`, async () => {
    const { git, context } = await createGit(quarantine)
    console.log('_root', context._root)
    await diffTest(newVersionBeta, dirQuarantineArr, git)
    await changePackagesFileGitCommit(context)
    await diffTest(newVersion, dirQuarantineCommandOrderChange1, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await diffTest(addVersion, dirQuarantineCommandOrderChange2, git)
  })
})
describe(`${cmd}: ${many}`, () => {
  test(`${many}: default(sync)`, async () => {
    const { git, context } = await createGit(many)
    await syncTest(newVersionBeta, dirManyArr, git)
    await changePackagesFileGitCommit(context)
    await syncTest(newVersion, dirManyArr, git)
    await setUpFilesAdded(context, [changePackagesFile2])
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
describe(`${cmd}: ${Interdependence}`, () => {
  test(`${Interdependence}: default(sync)`, async () => {
    const { git, context } = await createGit(Interdependence)
    await syncTest(newVersionBeta, dirInterdependenceArr, git)
    await changePackagesFileGitCommit(context)
    await syncTest(newVersion, dirInterdependenceArr, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await syncTest(addVersion, dirInterdependenceArr, git)
  })
  test(`${Interdependence}`, async () => {
    const { git, context } = await createGit(Interdependence)
    await diffTest(newVersionBeta, dirInterdependenceArr, git)
    await changePackagesFileGitCommit(context)
    await diffTest(newVersion, dirInterdependenceCommandOrder, git)
    await setUpFilesAdded(context, [changePackagesFile2])
    await diffTest(addVersion, dirInterdependenceCommandOrderChange1, git)
  })
})

describe(`${cmd}: ${single}`, () => {
  test(`${single}: default(sync)`, async () => {
    const { git } = await createGit(single)
    await syncTest(newVersionBeta, rootPackageJsonArr, git)
  })
  test(`${single}`, async () => {
    const { git, context } = await createGit(single)
    await diffTest(newVersionBeta, rootPackageJsonArr, git)
    await changePackagesFileGitCommit(context)
    await diffTest(newVersion, rootPackageJsonArr, git)
  })
})
