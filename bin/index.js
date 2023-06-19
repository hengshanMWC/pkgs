const {
  cliMain,
} = require('../dist/index.js')
const pakcage = require('../package.json')
function main (argv) {
  cliMain(argv, pakcage.version)
}
module.exports = main
