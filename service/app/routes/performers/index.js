const express = require('express')

const { addNewPerformer } = require('./operations')
const { endpoint_AllEntries, endpoint_SingleEntry } = require('../shared')
const CONSTANTS = require('../../const')

const router = express.Router()

router.get('/', endpoint_AllEntries(CONSTANTS.PERFORMERS))

router.get('/:performerId', endpoint_SingleEntry('performerId', CONSTANTS.PERFORMERS))

router.post('/add', addNewPerformer)

module.exports = router
