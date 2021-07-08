const express = require('express')

const { writeToFile, loadFromFile } = require('./filesystem')
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
    const primeCache = await initializePrimeCache(loaded)
    const rawCache = convertPrimeCacheToRaw(primeCache)

    const worky = rawCache["WORKS"]

    Object.keys(worky).map(key => {
        if (Math.random() > 0.99) console.log(worky[key])
    })

    // app.use(routes)

    // app.listen(port, () => {
    //     console.log(`Example app listening at http://localhost:${port}`)
    // })

}
