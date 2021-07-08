const { promisify } = require('util');
const { deflate, unzip } = require('zlib');

const asyncDeflate = promisify(deflate)
const asyncUnzip = promisify(unzip)

const { catalexEncoding: BUFFER_ENCODING } = process.env


const compress = async (inputString) => {
    const buffer = await asyncDeflate(inputString)
    return buffer.toString(BUFFER_ENCODING)
}

const decompress = async (compressedString) => {
    const inputBuffer = Buffer.from(compressedString, BUFFER_ENCODING)
    const buf = await asyncUnzip(inputBuffer)
    return buf.toString()
}

exports.compress = compress
exports.decompress = decompress
