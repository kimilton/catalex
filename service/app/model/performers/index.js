const CONSTANTS = require('../../const')
const { numToFixed, constructDefaultModel, sanitizeRequest } = require('../shared')

const MODEL_SCHEMA = {
    [CONSTANTS.ID_COLUMN_KEY]: {
        required: true,
        primaryKey: true,
    },
    firstName: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    middleName: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    lastName: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    otherNames: {
        required: false,
        multiStore: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    retired: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_BOOLEAN,
    },
    birthYear: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_BOOLEAN,
    },
    image: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
}

const getDefaultModel = () => constructDefaultModel(MODEL_SCHEMA)

const getInsertionObject = (insertionRequest, primaryKeyValidator) => {
    if (typeof primaryKeyValidator !== "function"){
        throw new Error(CONSTANTS.ERROR_INVALID_OPERATION)
    }
    let extractedId
    let suffix = 0
    const suffixMax = Math.pow(10, CONSTANTS.ID_SUFFIX_DIGIT_LENGTH) - 1
    while (!primaryKeyValidator(extractedId) && suffix < suffixMax){
        suffix++
        extractedId = generateIdFromName(insertionRequest.firstName, insertionRequest.lastName, suffix)
    }
    if (suffix >= suffixMax){
        throw new Error(CONSTANTS.ERROR_OUT_OF_BOUNDS)
    }
    const insertionRequestWithId = {
        ...insertionRequest,
        [CONSTANTS.ID_COLUMN_KEY]: extractedId
    }
    console.log(extractedId)
    return sanitizeRequest(insertionRequestWithId, DEFAULT_MODEL)
}

const generateIdFromName = (firstName, lastName, suffix) => {
    if (firstName && lastName){
        let suffixStr = numToFixed(suffix)
        let firstId = firstName.slice(0,3).toUpperCase()
        let lastId = lastName.slice(0,3).toUpperCase()
        return `${firstId}${lastId}${suffixStr}`
    }
    throw new Error(CONSTANTS.ERROR_MISSING_INFO)
}


module.exports = {
    getDefaultModel,
    getInsertionObject,
    generateIdFromName,
}
