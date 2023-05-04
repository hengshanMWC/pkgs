const {
  cliMain,
} = require('../dist/pkgs.cjs.min')
const pakcage = require('../package.json')
function main (argv) {
  cliMain(argv, pakcage.version)
}
module.exports = main
