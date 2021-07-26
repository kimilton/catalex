const express = require('express')

const { loadFromFile, writeToFile } = require('./filesystem')
const { initializePrimeCache, convertPrimeCacheToRaw } = require('./persistence')
const routes = require('./routes')

const CONSTANTS = require('./const')

const app = express()
const port = 8080

module.exports = async () => {

    console.log('Application started.')

    const [ loaded, fileLoadError ] = await loadFromFile()
    if (fileLoadError) {
        console.error(fileLoadError)
        return
    }

    await initializePrimeCache(loaded)
    
    app.use(express.json())
    app.use(routes)

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })

}
