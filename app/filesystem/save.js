const fs = require('fs/promises')
const path = require('path')

const { compress, decompress } = require('../compression')
const CONSTANTS = require('../const')

const { catalexSavePath, catalexSaveFile, catalexEncoding: BUFFER_ENCODING } = process.env
const SAVE_FILE_PATH = `${catalexSavePath}${path.sep}${catalexSaveFile}`

const loadFromFile = async () => {
    try {
        const loadedData = await fs.readFile(SAVE_FILE_PATH, {encoding: BUFFER_ENCODING})
        const decompressedData = await decompress(loadedData)
        return [JSON.parse(decompressedData), null]
    } catch (err){
        return [null, err.toString()]
    }
}

const writeToFile = async (input) => {
    try {
        const strData = JSON.stringify(input)
        console.log(strData)
        const compressedData = await compress(strData)
        await fs.writeFile(SAVE_FILE_PATH, compressedData, {encoding: BUFFER_ENCODING})
    } catch (err){
        return err.toString()
    }
    return CONSTANTS.SUCCESS
}

exports.loadFromFile = loadFromFile
exports.writeToFile = writeToFile
