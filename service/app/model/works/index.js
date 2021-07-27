const CONSTANTS = require('../../const')
const { constructDefaultModel, sanitizeRequest, toSafeId } = require('../shared')

const MODEL_SCHEMA = {
    [CONSTANTS.ID_COLUMN_KEY]: {
        required: true,
        primaryKey: true,
    },
    [CONSTANTS.DIRPATH_COLUMN_KEY]: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    [CONSTANTS.FULLFILEPATH_COLUMN_KEY]: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    labelId: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    numbering: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    subIdentifier: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
    createdYear: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    createdMonth: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    downloadedTimestamp: {
        required: true,
        enforceType: CONSTANTS.DATATYPE_NUMBER,
    },
    image: {
        required: false,
        enforceType: CONSTANTS.DATATYPE_STRING,
    },
}

const getDefaultModel = () => constructDefaultModel(MODEL_SCHEMA)

const getUpdateObject = updateRequest => sanitizeRequest(updateRequest, MODEL_SCHEMA)

const generateRawObject = (id, directory, fullPath) => ({
    [CONSTANTS.ID_COLUMN_KEY]: toSafeId(id),
    [CONSTANTS.DIRPATH_COLUMN_KEY]: directory,
    [CONSTANTS.FULLFILEPATH_COLUMN_KEY]: fullPath
})

const generateCachePartialFromList = filesList => {
    const cachePartial = {}
    for (let raw of filesList){
        const unsafeId = raw[CONSTANTS.ID_COLUMN_KEY]
        const safeId = toSafeId(unsafeId)
        cachePartial[safeId] = {...getDefaultModel(), ...raw}
    }
    return cachePartial
}

module.exports = {
    getDefaultModel,
    getUpdateObject,
    generateRawObject,
    generateCachePartialFromList,
}