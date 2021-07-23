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

    // await _manuallyOverriteFile()
    // _manuallyVerifyPrimeCache()
    
    app.use(express.json())
    app.use(routes)

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })

}

const _manuallyOverriteFile = async () => {
    const rawCache = convertPrimeCacheToRaw()
    const writeResult = await writeToFile(rawCache)
    if (writeResult !== CONSTANTS.SUCCESS){
        console.error(writeResult)
        return
    }
}

const _manuallyVerifyPrimeCache = () => {
    const rawCache = convertPrimeCacheToRaw()
    Object.keys(rawCache).map(key => {
        console.log(key)
        Object.values(rawCache[key]).map(entry => {
            if (Math.random() > 0.995) console.log(entry)
        })
    })
}
