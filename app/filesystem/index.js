const { writeToFile, loadFromFile } = require('./save')
const { scanDirectory } = require('./scan')

module.exports = {
    writeToFile,
    loadFromFile,
    scanDirectory,
}
