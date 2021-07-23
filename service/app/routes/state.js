const express = require('express')

const { writeToFile } = require('../filesystem')
const { convertPrimeCacheToRaw } = require('../persistence')
const { jsonWrap, jsonWrapErr } = require('../protocol')
const CONSTANTS = require('../const')

const router = express.Router()

router.get('/save', async (req, res) => {
    const rawCache = convertPrimeCacheToRaw()
    const writeResult = await writeToFile(rawCache)
    if (writeResult !== CONSTANTS.SUCCESS){
        res.status(500).json(jsonWrapErr(CONSTANTS.ERROR_SERVICE_ERROR)).end()
        return
    }
    res.json(jsonWrap(writeResult)).end()
})

module.exports = router
