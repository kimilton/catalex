const express = require('express')

const { getSubCache } = require('../persistence')
const { toSafeId } = require('../model')
const CONSTANTS = require('../const')

const router = express.Router()

router.get('/', function (req, res) {
    res.send(`/works`)
})

router.get('/:workId', function (req, res) {
    let workId = req.params.workId
    if (!workId) res.status(400).end(CONSTANTS.ERROR_INVALID_ID)

    const worksCache = getSubCache(CONSTANTS.WORKS)

    workId = toSafeId(workId)
    const entries = worksCache.read()
    const entry = entries[workId]
    if (entry){
        res.json(entry).end()
        return
    }

    res.status(404).end(CONSTANTS.ERROR_INVALID_ID)
})

module.exports = router
