const { toSafeId } = require('../model')
const { jsonWrap, jsonWrapErr } = require('../protocol')
const { getSubCache } = require('../persistence')
const CONSTANTS = require('../const')

const getDefaultIdValidator = (cache) => {
    return id => id && !cache.hasEntry(id)
}

/**
 * Shared Endpoint Functions Start Here
 * 
 * These functions are designed to be universally applicable to anything that inherits from the SubCache class
 */

const endpoint_AllEntries = subcacheId => (req, res) => {
    const subcache = getSubCache(subcacheId)
    const entries = subcache.read()
    const entriesId = Object.keys(entries)
    res.json(jsonWrap(entriesId))
}

const endpoint_SingleEntry = (param, subcacheId) => (req, res) => {
    let unsafeId = req.params[param]
    if (!unsafeId) res.status(400).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()
    const subcache = getSubCache(subcacheId)
    const safeId = toSafeId(unsafeId)
    const entries = subcache.read()
    const entry = entries[safeId]
    if (entry){
        res.json(jsonWrap(entry)).end()
        return
    }

    res.status(404).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()
}

module.exports = {
    getDefaultIdValidator,
    endpoint_AllEntries,
    endpoint_SingleEntry,
}
