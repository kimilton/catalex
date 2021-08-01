const { jsonWrap, jsonWrapErr } = require('../protocol')
const persistence = require('../persistence')
const CONSTANTS = require('../const')

const getDefaultIdValidator = (cache) => {
    return id => id && !cache.hasEntry(id)
}

/**
 * Shared Endpoint Functions Start Here
 * 
 * These functions are designed to be universally applicable to anything that inherits from the SubCache class
 */

const endpoint_ListEntries = subCacheId => (req, res) => {
    const entryIds = persistence.list(subCacheId)
    res.json(jsonWrap(entryIds)).end()
}

const endpoint_SingleEntry = (param, subCacheId) => (req, res) => {
    let entryId = req.params[param]
    if (!entryId) res.status(400).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()
    const entry = persistence.readEntry(subCacheId, entryId)
    if (entry){
        res.json(jsonWrap(entry)).end()
        return
    }

    res.status(404).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()
}

module.exports = {
    getDefaultIdValidator,
    endpoint_ListEntries,
    endpoint_SingleEntry,
}
