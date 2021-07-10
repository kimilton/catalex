const { writeToFile, loadFromFile } = require('./rw')
const { scanDirectory } = require('./scan')

module.exports = {
    writeToFile,
    loadFromFile,
    scanDirectory,
}
