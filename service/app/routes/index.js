const express = require('express')
const worksRouter = require('./works')
const performersRouter = require('./performers')
const stateRouter = require('./state')
const router = express.Router()

router.use('/works', worksRouter)
router.use('/performers', performersRouter)
router.use('/state', stateRouter)

module.exports = router
