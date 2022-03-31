import fs from 'fs'
import path from 'path'

const files = {
  /**
   * Creates a file in the "test/.tmp" directory with the given contents
   *
   * @param {string} name - The file name (e.g. "package.json")
   * @param {string|object} [contents] - The file contents
   */
  create (name: string, contents: string | any) {
    if (typeof contents === 'object') {
      contents = JSON.stringify(contents, null, 2)
    }
    const filePath = path.join(process.cwd(), name)
    const dirPath = path.dirname(filePath)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(name, contents)
  },

  /**
   * Reads a file in the "test/.tmp" directory, and returns its contents as a string.
   *
   * @param {string} name - The file name (e.g. "README.md", "script1.js")
   * @returns {object}
   */
  text (name: string) {
    try {
      return fs.readFileSync(path.join(name), 'utf8')
    }
    catch (e) {
      return ''
    }
  },

  /**
   * Parses a JSON file in the "test/.tmp" directory, and returns its contents
   * as a JavaScript object.
   *
   * @param {string} name - The file name (e.g. "package.json")
   * @returns {object|undefined}
   */
  json (name: string) {
    try {
      const json = files.text(name)
      return JSON.parse(json)
    }
    catch (e) {
      return {}
    }
  },
}
export default files
