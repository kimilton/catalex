const CONSTANTS = require('../../const')

const UNSAFE_ID_SEPARATOR = '-'
const SAFE_ID_SEPARATOR = '_'

const toSafeId = unsafe => unsafe.split(UNSAFE_ID_SEPARATOR).join(SAFE_ID_SEPARATOR).toUpperCase()
const toUnsafeId = safe => safe.split(SAFE_ID_SEPARATOR).join(UNSAFE_ID_SEPARATOR).toUpperCase()
const numToFixed = (num, fixedLength=3) => {
    if (num >= Math.pow(10, fixedLength) || num < 0){
        throw new Error(CONSTANTS.ERROR_GENERIC)
    }
    let numStr = String(num)
    while (numStr.length < fixedLength){
        numStr = "0"+numStr
    }
    return numStr
}

const certifyEntry = entry => ({
    ...entry,
    timestamp: Date.now()
})

exports.certifyEntry = certifyEntry
exports.toSafeId = toSafeId
exports.toUnsafeId = toUnsafeId
exports.numToFixed = numToFixed
