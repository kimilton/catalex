const express = require('express')

const { addNewPerformer, updatePerformer } = require('./operations')
const { endpoint_AllEntries, endpoint_SingleEntry } = require('../shared')
const CONSTANTS = require('../../const')

const router = express.Router()

/* GET */
router.get('/', endpoint_AllEntries(CONSTANTS.PERFORMERS))
router.get('/:performerId', endpoint_SingleEntry('performerId', CONSTANTS.PERFORMERS))

/* POST */
router.post('/add', addNewPerformer)

/* PUT */
router.put('/update/:performerId', updatePerformer)

module.exports = router
