const express = require('express')
const worksRouter = require('./works')
const performersRouter = require('./performers')
const router = express.Router()


router.use('/works', worksRouter)
router.use('/performers', performersRouter)

module.exports = router
