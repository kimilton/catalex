const CONSTANTS = require('../../const')

const UNSAFE_ID_SEPARATOR = '-'
const SAFE_ID_SEPARATOR = '_'

const _validateDataType = (data, dataType) => {
    switch (dataType){
        case CONSTANTS.DATATYPE_BOOLEAN:
            return typeof data === "boolean"
        case CONSTANTS.DATATYPE_NUMBER:
            return typeof data === "number"
        case CONSTANTS.DATATYPE_STRING:
            return typeof data === "string"
        case CONSTANTS.DATATYPE_ANY:
            return true
        default:
            return false
    }
}

const _getDataTypeDefaults = dataType => {
    switch (dataType){
        case CONSTANTS.DATATYPE_BOOLEAN:
            return CONSTANTS.BOOLEAN_UNKNOWN
        case CONSTANTS.DATATYPE_NUMBER:
            return 0
        case CONSTANTS.DATATYPE_STRING:
        case CONSTANTS.DATATYPE_ANY:
        default:
            return ""
    }
}

const toSafeId = unsafe => unsafe.split(UNSAFE_ID_SEPARATOR).join(SAFE_ID_SEPARATOR).toUpperCase()
const toUnsafeId = safe => safe.split(SAFE_ID_SEPARATOR).join(UNSAFE_ID_SEPARATOR).toUpperCase()
const numToFixed = (num, fixedLength=CONSTANTS.ID_SUFFIX_DIGIT_LENGTH) => {
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


const constructDefaultModel = () => {
    let constructedModel = {}
    for (let [key, config] of Object.entries(DEFAULT_MODEL)){
        if (config.multiStore){
            constructedModel[key] = []
        } else {
            constructedModel[key] = _getDataTypeDefaults(config.enforceType)
        }
    }
    return constructedModel
}

const sanitizeRequest = (insertionRequest, model) => {
    const validatedRequest = {}
    for (let [key, config] of Object.entries(model)){
        if (insertionRequest.hasOwnProperty(key)){
            let insertValue = insertionRequest[key]
            if (config.enforceType) {
                if (config.multiStore){
                    if (!insertValue.slice().every(val => _validateDataType(val, config.enforceType))){
                        console.error(`enforce type failed for multiple ${key}`)
                        return CONSTANTS.ERROR_INVALID_OPERATION
                    }
                } else if (!_validateDataType(insertValue, config.enforceType)){
                    console.error(`enforce type failed for single ${key}`)
                    return CONSTANTS.ERROR_INVALID_OPERATION
                }
            }
            validatedRequest[key] = insertValue
        } else if (config.required){
            return CONSTANTS.ERROR_MISSING_INFO
        }
    }
    return validatedRequest
}

exports.certifyEntry = certifyEntry
exports.constructDefaultModel = constructDefaultModel
exports.sanitizeRequest = sanitizeRequest
exports.toSafeId = toSafeId
exports.toUnsafeId = toUnsafeId
exports.numToFixed = numToFixed
