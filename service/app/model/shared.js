const cloneDeep = require('lodash/cloneDeep')

const CONSTANTS = require('../const')

const UNSAFE_ID_SEPARATOR = '-'
const SAFE_ID_SEPARATOR = '_'

const _validateDataType = (data, dataType) => {
    switch (dataType){
        case CONSTANTS.DATATYPE_BOOLEAN:
            const isImplicitBoolean = ['TRUE', 'FALSE', CONSTANTS.BOOLEAN_UNKNOWN].includes(data.toUpperCase())
            return typeof data === "boolean" || isImplicitBoolean
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

const _castDataType = (data, dataType) => {
    switch (dataType){
        case CONSTANTS.DATATYPE_BOOLEAN:
            if (data.toUpperCase() === "TRUE") return true
            if (data.toUpperCase() === "FALSE") return false
            return data
        case CONSTANTS.DATATYPE_NUMBER:
            return Number(data)
        case CONSTANTS.DATATYPE_STRING:
        case CONSTANTS.DATATYPE_ANY:
            return data
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

const cloneAndCertify = entry => {
    const clonedEntry = cloneDeep(entry)
    if (!clonedEntry[CONSTANTS.SANITIZATION_SEAL_KEY]){
        throw new Error(CONSTANTS.ERROR_UNSAFE_OPERATION)
    }
    delete clonedEntry[CONSTANTS.SANITIZATION_SEAL_KEY]
    return {
        ...clonedEntry,
        timestamp: Date.now()
    }
}


const constructDefaultModel = modelSchema => {
    let constructedModel = {}
    for (let [key, config] of Object.entries(modelSchema)){
        if (config.multiStore){
            constructedModel[key] = []
        } else {
            constructedModel[key] = _getDataTypeDefaults(config.enforceType)
        }
    }
    return constructedModel
}

const sanitizeRequest = (insertionRequest, model, checkForRequiredFields = false) => {
    const validatedRequest = {}
    for (let [key, config] of Object.entries(model)){
        if (insertionRequest.hasOwnProperty(key)){
            let insertValue = insertionRequest[key]
            if (config.enforceType) {
                if (config.multiStore){
                    if (!insertValue.every(val => _validateDataType(val, config.enforceType))){
                        console.error(`enforce type failed for multiple ${key}`)
                        return CONSTANTS.ERROR_INVALID_OPERATION
                    }
                    insertValue = insertValue.slice().map(val => _castDataType(val, config.enforceType))
                } else {
                    if (!_validateDataType(insertValue, config.enforceType)){
                        console.error(`enforce type failed for single ${key}`)
                        return CONSTANTS.ERROR_INVALID_OPERATION
                    }
                    insertValue = _castDataType(insertValue, config.enforceType)
                }
            }
            validatedRequest[key] = insertValue
        } else if (checkForRequiredFields && config.required){
            return CONSTANTS.ERROR_MISSING_INFO
        }
    }
    validatedRequest[CONSTANTS.SANITIZATION_SEAL_KEY] = true
    return validatedRequest
}

exports.cloneAndCertify = cloneAndCertify
exports.constructDefaultModel = constructDefaultModel
exports.sanitizeRequest = sanitizeRequest
exports.toSafeId = toSafeId
exports.toUnsafeId = toUnsafeId
exports.numToFixed = numToFixed
