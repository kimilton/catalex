const express = require('express')

const { addNewPerformer } = require('./operations')
const { getSubCache } = require('../../persistence')
const { jsonWrap, jsonWrapErr } = require('../../protocol')
const CONSTANTS = require('../../const')

const router = express.Router()

router.get('/', (req, res) => {
    const worksCache = getSubCache(CONSTANTS.PERFORMERS)
    const entries = worksCache.read()
    const entriesId = Object.keys(entries)
    res.json(jsonWrap(entriesId))
})

router.get('/:performerId', (req, res) => {
    res.send(`/performers/${req.params.performerId}`)
})

router.post('/add', addNewPerformer)

module.exports = router
