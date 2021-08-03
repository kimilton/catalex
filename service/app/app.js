const express = require('express')

const persistence = require('./persistence')
const routes = require('./routes')
const { loadFromFile } = require('./filesystem')
const { requestLoggerMiddleware } = require('./logging/middleware')

const app = express()
const port = 8080

module.exports = async () => {

    console.log('Application started.')

    // Attempt to restore cache state from local file
    const [ archivedData, fileLoadError ] = await loadFromFile()
    if (fileLoadError) {
        console.log('Unable to read file contents! Instantiating an empty cache.')
        persistence.initializePersistence()
    } else {
        console.log('Cache state restored successfully.')
        persistence.initializePersistence(archivedData)
    }
    
    // Register middlewares here
    app.use(express.json())
    app.use(requestLoggerMiddleware)
    app.use(routes)

    app.listen(port, () => {
        console.log(`=================================================\n`)
        console.log(`Example app listening at http://localhost:${port}\n`)
    })

}
