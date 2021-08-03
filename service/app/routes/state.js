const express = require('express')

const persistence = require('../persistence')
const { writeToFile } = require('../filesystem')
const { jsonWrap, jsonWrapErr } = require('../protocol')

const CONSTANTS = require('../const')

const router = express.Router()

router.get('/save', async (req, res) => {
    const stateDump = persistence.getPersistanceStateDump()
    const writeResult = await writeToFile(stateDump)
    if (writeResult !== CONSTANTS.SUCCESS){
        res.status(500).json(jsonWrapErr(CONSTANTS.ERROR_SERVICE_ERROR)).end()
        return
    }
    res.json(jsonWrap(writeResult)).end()
})

module.exports = router
