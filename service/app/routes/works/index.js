const express = require('express')

const { endpoint_AllEntries, endpoint_SingleEntry } = require('../shared')
const CONSTANTS = require('../../const')

const router = express.Router()

router.get('/', endpoint_AllEntries(CONSTANTS.WORKS))

router.get('/:workId', endpoint_SingleEntry('workId', CONSTANTS.WORKS))

module.exports = router
