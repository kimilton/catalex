const CONSTANTS = require('../../const')
const { getPerformerInsertionObject } = require('../../model')
const { getSubCache } = require('../../persistence')
const { getDefaultIdValidator } = require('../shared')

const addNewPerformer = (req, res) => {
    // Get the relevant cache. This is used for unique key generation and for insertion later
    const performersCache = getSubCache(CONSTANTS.PERFORMERS)
    // Id validator logic should be universal. Use the shared one unless there are special requirements
    const idValidator = getDefaultIdValidator(performersCache)
    // Inserting a new object means sanitizing input and attaching some metadata
    const performerInsertionObject = getPerformerInsertionObject(req.body, idValidator)
    // Cache saves the object and returns a copy that has been certified by the cache
    const savedObject = performersCache.addEntry(performerInsertionObject)
    res.json(savedObject)
}

module.exports = {
    addNewPerformer
}
