const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.send(`/works -> ${req.data.ads}`)
})

router.get('/:workId', function (req, res) {
    res.send(`/works/${req.params.workId}`)
})

module.exports = router
