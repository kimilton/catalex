const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.send('/performers')
})

router.get('/:performerId', function (req, res) {
    res.send(`/performers/${req.params.performerId}`)
})

module.exports = router
