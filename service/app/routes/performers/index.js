const express = require('express')

const { addNewPerformer, updatePerformer } = require('./operations')
const { endpoint_ListEntries, endpoint_SingleEntry } = require('../shared')
const CONSTANTS = require('../../const')

const router = express.Router()

/* GET */
router.get('/', endpoint_ListEntries(CONSTANTS.PERFORMERS))
router.get('/:performerId', endpoint_SingleEntry('performerId', CONSTANTS.PERFORMERS))

/* POST */
router.post('/add', addNewPerformer)

/* PUT */
router.put('/update/:performerId', updatePerformer)

module.exports = router
