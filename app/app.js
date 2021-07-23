const express = require('express')

const { loadFromFile, writeToFile } = require('./filesystem')
const { singletonCache, initializePrimeCache, convertPrimeCacheToRaw } = require('./persistence')
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

    initializePrimeCache(singletonCache, loaded)

    // await _manuallyOverriteFile(primeCache)

    app.use(routes)

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })

}

const _manuallyOverriteFile = async primeCache => {
    const rawCache = convertPrimeCacheToRaw(primeCache)
    const writeResult = await writeToFile(rawCache)
    if (writeResult !== CONSTANTS.SUCCESS){
        console.error(writeResult)
        return
    }
}

const _manuallyVerifyPrimeCache = primeCache => {
    const rawCache = convertPrimeCacheToRaw(primeCache)
    Object.keys(rawCache).map(key => {
        console.log(key)
        Object.values(rawCache[key]).map(entry => {
            if (Math.random() > 0.995) console.log(entry)
        })
    })
}
