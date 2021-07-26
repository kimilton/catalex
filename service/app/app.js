const express = require('express')

const { loadFromFile } = require('./filesystem')
const { initializePrimeCache } = require('./persistence')
const routes = require('./routes')
const { requestLoggerMiddleware } = require('./logging/middleware')

const app = express()
const port = 8080

module.exports = async () => {

    console.log('Application started.')

    // Attempt to restore cache state from local file
    const [ loaded, fileLoadError ] = await loadFromFile()
    if (fileLoadError) {
        console.log('Unable to read file contents. Scanning harddrive.')
        await initializePrimeCache({}, true)
    } else {
        console.log('Cache state restored successfully.')
        await initializePrimeCache(loaded)
    }
    
    // Register middlewares here
    app.use(express.json())
    app.use(requestLoggerMiddleware)
    app.use(routes)

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}\n`)
    })

}
