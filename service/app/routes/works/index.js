const express = require('express')

const { rel, performScan } = require('./operations')
const { endpoint_ListEntries, endpoint_SingleEntry } = require('../shared')
const CONSTANTS = require('../../const')

const router = express.Router()

/* GET */
router.get('/', endpoint_ListEntries(CONSTANTS.WORKS))
router.get('/scan', performScan)
router.get('/rel', rel)
router.get('/:workId', endpoint_SingleEntry('workId', CONSTANTS.WORKS))

module.exports = router
