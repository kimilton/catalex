const express = require('express')

const { getSubCache } = require('../persistence')
const { toSafeId } = require('../model')
const { jsonWrap, jsonWrapErr } = require('../protocol')
const CONSTANTS = require('../const')

const router = express.Router()

router.get('/', (req, res) => {
    const worksCache = getSubCache(CONSTANTS.WORKS)
    const entries = worksCache.read()

    const entriesId = Object.keys(entries)
    res.json(jsonWrap(entriesId))
})

router.get('/:workId', (req, res) => {
    let workId = req.params.workId
    if (!workId) res.status(400).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()

    const worksCache = getSubCache(CONSTANTS.WORKS)

    workId = toSafeId(workId)
    const entries = worksCache.read()
    const entry = entries[workId]
    if (entry){
        res.json(jsonWrap(entry)).end()
        return
    }

    res.status(404).json(jsonWrapErr(CONSTANTS.ERROR_INVALID_ID)).end()
})

module.exports = router
