const express = require('express')

const CONSTANTS = require('../../const')
const { getPerformerInsertion } = require('../../model')

const router = express.Router()


router.get('/', (req, res) => {
    res.send('/performers')
})

router.get('/:performerId', (req, res) => {
    res.send(`/performers/${req.params.performerId}`)
})

router.post('/add', (req, res) => {
    console.log(req.body)
    const performerInsertionObject = getPerformerInsertion(req.body, v => v)
    console.log(performerInsertionObject)
    res.json(performerInsertionObject)
})

module.exports = router
