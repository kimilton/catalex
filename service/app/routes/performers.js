const express = require('express')

const CONSTANTS = require('../const')

const router = express.Router()

router.get('/', (req, res) => {
    res.send('/performers')
})

router.get('/:performerId', (req, res) => {
    res.send(`/performers/${req.params.performerId}`)
})

router.post('/add', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

module.exports = router
