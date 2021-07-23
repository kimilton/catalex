const express = require('express')

const { singletonCache } = require('../persistence')
const { toSafeId } = require('../model')
const CONSTANTS = require('../const')

const router = express.Router()

router.get('/', function (req, res) {
    res.send(`/works -> ${req.data.ads}`)
})

router.get('/:workId', function (req, res) {
    let workId = req.params.workId
    if (!workId) res.status(400).send('No workId')

    workId = toSafeId(workId)
    const cache = singletonCache[CONSTANTS.WORKS].getCache()
    const entry = cache.get(workId, {})
    res.send(entry)

})

module.exports = router
