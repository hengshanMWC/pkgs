
import fs from 'fs'
import rimraf from 'rimraf'

/**
 * Clean the .tmp directory before each test
 */
beforeEach(async () => {
  // Delete the .tmp directory, if it exists
  await new Promise((resolve, reject) => {
    rimraf('test/.tmp', err => err ? reject(err) : resolve(true))
  })

  // Re-create the .tmp directory
  await new Promise((resolve, reject) => {
    fs.mkdir('test/.tmp', err => err ? reject(err) : resolve(true))
  })
})
